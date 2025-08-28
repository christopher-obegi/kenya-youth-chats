import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const callbackData = await req.json()
    console.log('M-Pesa Callback received:', JSON.stringify(callbackData, null, 2))

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { Body } = callbackData
    const { stkCallback } = Body

    if (!stkCallback) {
      console.error('Invalid callback format')
      return new Response('Invalid callback format', { status: 400 })
    }

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata
    } = stkCallback

    // Find the payment record
    const { data: payment, error: findError } = await supabase
      .from('payments')
      .select('*')
      .eq('checkout_request_id', CheckoutRequestID)
      .single()

    if (findError || !payment) {
      console.error('Payment record not found:', CheckoutRequestID)
      return new Response('Payment record not found', { status: 404 })
    }

    let updateData: any = {
      result_code: ResultCode,
      result_desc: ResultDesc,
      raw_response: callbackData
    }

    if (ResultCode === 0) {
      // Payment successful
      updateData.status = 'completed'
      
      // Extract payment details from callback metadata
      if (CallbackMetadata && CallbackMetadata.Item) {
        const items = CallbackMetadata.Item
        const receiptNumber = items.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value
        const transactionDate = items.find((item: any) => item.Name === 'TransactionDate')?.Value
        const phoneNumber = items.find((item: any) => item.Name === 'PhoneNumber')?.Value

        if (receiptNumber) updateData.mpesa_receipt = receiptNumber
        if (transactionDate) updateData.transaction_date = transactionDate
        if (phoneNumber) updateData.phone = phoneNumber.toString()
      }
    } else {
      // Payment failed or cancelled
      updateData.status = 'failed'
    }

    // Update payment record
    const { error: updateError } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', payment.id)

    if (updateError) {
      console.error('Failed to update payment:', updateError)
      return new Response('Failed to update payment', { status: 500 })
    }

    // If payment successful, update appointment status
    if (ResultCode === 0) {
      const { error: appointmentError } = await supabase
        .from('appointments')
        .update({ status: 'confirmed' })
        .eq('id', payment.booking_id)

      if (appointmentError) {
        console.error('Failed to update appointment:', appointmentError)
      }
    }

    console.log(`Payment ${payment.id} updated successfully. Status: ${updateData.status}`)

    return new Response(
      JSON.stringify({ success: true, message: 'Callback processed successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Callback processing error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
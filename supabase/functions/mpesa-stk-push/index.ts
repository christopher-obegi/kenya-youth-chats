import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface STKPushRequest {
  phone: string;
  amount: number;
  account_reference: string;
  transaction_desc: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phone, amount, account_reference, transaction_desc }: STKPushRequest = await req.json()

    // Validate input
    if (!phone || !amount || !account_reference) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // M-Pesa API credentials (these should be in environment variables)
    const CONSUMER_KEY = Deno.env.get('MPESA_CONSUMER_KEY')
    const CONSUMER_SECRET = Deno.env.get('MPESA_CONSUMER_SECRET')
    const BUSINESS_SHORT_CODE = Deno.env.get('MPESA_BUSINESS_SHORT_CODE')
    const PASSKEY = Deno.env.get('MPESA_PASSKEY')
    const CALLBACK_URL = Deno.env.get('MPESA_CALLBACK_URL')

    if (!CONSUMER_KEY || !CONSUMER_SECRET || !BUSINESS_SHORT_CODE || !PASSKEY) {
      return new Response(
        JSON.stringify({ success: false, message: 'M-Pesa configuration missing' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Get OAuth token
    const auth = btoa(`${CONSUMER_KEY}:${CONSUMER_SECRET}`)
    const tokenResponse = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    })

    const tokenData = await tokenResponse.json()
    if (!tokenData.access_token) {
      throw new Error('Failed to get M-Pesa access token')
    }

    // Generate timestamp and password
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3)
    const password = btoa(`${BUSINESS_SHORT_CODE}${PASSKEY}${timestamp}`)

    // STK Push request
    const stkPushPayload = {
      BusinessShortCode: BUSINESS_SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone,
      PartyB: BUSINESS_SHORT_CODE,
      PhoneNumber: phone,
      CallBackURL: CALLBACK_URL || 'https://your-app.com/api/mpesa/callback',
      AccountReference: account_reference,
      TransactionDesc: transaction_desc || 'Therapy Session Payment'
    }

    const stkResponse = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stkPushPayload),
    })

    const stkData = await stkResponse.json()

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (stkData.ResponseCode === '0') {
      // Update payment record with M-Pesa details
      await supabase
        .from('payments')
        .update({
          merchant_request_id: stkData.MerchantRequestID,
          checkout_request_id: stkData.CheckoutRequestID,
          raw_response: stkData,
          status: 'pending'
        })
        .eq('id', account_reference)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'STK Push sent successfully',
          merchant_request_id: stkData.MerchantRequestID,
          checkout_request_id: stkData.CheckoutRequestID
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // Update payment record as failed
      await supabase
        .from('payments')
        .update({
          status: 'failed',
          raw_response: stkData,
          result_desc: stkData.errorMessage || 'STK Push failed'
        })
        .eq('id', account_reference)

      return new Response(
        JSON.stringify({
          success: false,
          message: stkData.errorMessage || 'STK Push failed',
          error_code: stkData.ResponseCode
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

  } catch (error) {
    console.error('STK Push error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
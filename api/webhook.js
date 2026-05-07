const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const email = session.customer_details.email;
        
        // Auto-grant premium in Supabase
        const { error } = await supabase
            .from('users')
            .upsert({ email: email.toLowerCase(), premium: true, hwid_locked: false })
            .select();

        if (error) {
            console.error('Supabase Error:', error);
            return res.status(500).json({ error: 'Failed to grant premium' });
        }
        console.log(`Granted Premium to ${email}`);
    }

    res.json({ received: true });
};

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { email, hwid } = req.body;
    if (!email || !hwid) return res.status(400).json({ error: 'Missing email or HWID' });

    try {
        // Fetch user from database
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase())
            .single();

        if (error || !user) {
            return res.status(404).json({ error: 'User not found or not premium' });
        }

        if (!user.premium) {
            return res.status(403).json({ error: 'Active premium subscription required' });
        }

        // HWID Locking Logic
        if (!user.hwid) {
            // First time login, bind HWID
            await supabase.from('users').update({ hwid: hwid }).eq('id', user.id);
            return res.status(200).json({ success: true, message: 'HWID Bound Successfully', premium: true });
        } else if (user.hwid !== hwid) {
            return res.status(401).json({ error: 'HWID Mismatch. Device is locked.' });
        }

        return res.status(200).json({ success: true, message: 'Authorized', premium: true });

    } catch (err) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

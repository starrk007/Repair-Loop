export function getCurrentUser(req, res) {
    return res.status(200).json({
        success: true,
        data: {
            uid: req.auth.uid,
            email: req.auth.email ?? null,
            emailVerified: req.auth.email_verified ?? false
        }
    });
}
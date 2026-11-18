export function getHealth(req, res) {
    return res.status(200).json({
        success: true,
        data: {
            service: 'repairloop-api',
            status: 'ok',
            timestamp: new Date().toISOString()
        }
    });
}
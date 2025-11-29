import aj from '../config/arcjet.js'

const arcjetMiddleware = async (req, res, next) => {
    try{
        const decision = await aj.protect(req, { requested: 1 });

        if(decision.isDenied()){
            if(decision.reason.isRateLimit()) return res.status(429).json({ error: 'Too Many Requests - your rate limit has been exceeded'});
            if(decision.reason.isBot()) return res.status(403).json({ error: 'Forbidden - bot traffic is not allowed'});
            if(decision.reason.isShield()) return res.status(403).json({error: 'Forbidden - your request was blocked by security rules'});


            return res.status(403).json({error: 'Forbidden - your request was denied'});
        }

        next();
    } catch (error) {
    console.log(`Arcjet middleware error: ${error} `);
    next(error);
    }
}

export default arcjetMiddleware;
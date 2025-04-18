import { Request , Response , NextFunction } from "express";

import jwt from 'jsonwebtoken'

export const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        
    
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer')){
         res.status(401).json({ message: 'Unauthorized' });
         return

    }
    const token = authHeader?.split(' ')?.[1];
    const JWT_SECRET = process.env.JWT_SECRET
    const decoded = jwt.verify(token , `${JWT_SECRET}`)
    console.log("decodeddecoded",decoded)

//     (req as any)?.email = decoded

    if(decoded){
          next()

    }else{
          res.status(403).json({ message: 'Unauthorized' });

    }


} catch (error) {
     res.status(403).json({ message: 'Unauthorized' });
        
}

}
import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller('csrf')
export class CsrfController {
  @Get()
  getCsrfToken(@Req() req: Request, @Res() res: Response) {
    // CSRF token auto ravishda cookieda set bo'ladi (csurf middleware tomonidan)
    // shunday ekan biz set bolgan tokenni response bodyda qaytramiz
    return res.json({ csrfToken: req.csrfToken() });
  }
}

// import { Controller, Get, Req, Res } from '@nestjs/common';
// import { Request, Response } from 'express';

// @Controller('csrf-token')
// export class CsrfController {
//   @Get()
//   getCsrfToken(@Req() req: Request, @Res() res: Response) {

//     const csrfToken = req.csrfToken();

//     res.cookie('XSRF-TOKEN', csrfToken, {
//       httpOnly: false,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//     });

//     return res.status(200).json({
//       message: 'CSRF token generated successfully',
//     });
//   }
// }

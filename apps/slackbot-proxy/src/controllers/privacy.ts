import type { PlatformRouter } from '@tsed/common';
import { Controller } from '@tsed/common';
import type { Request, Response } from 'express';

const isOfficialMode = process.env.OFFICIAL_MODE === 'true';

@Controller('/privacy')
export class PrivacyCtrl {

  constructor(router: PlatformRouter) {
    if (isOfficialMode) {
      router.get('/', this.getPrivacy);
    }
  }

  getPrivacy(req: Request, res: Response): string|void {
    res.render('privacy.ejs');
  }

}

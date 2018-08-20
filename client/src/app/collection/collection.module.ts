import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NouisliderModule } from 'ng2-nouislider';

import { AuthModule } from '../auth/auth.module';
import { AuthGuard } from '../auth/services/auth-guard.service';
import { BetaLoginGuard } from '../core/services/beta-login-guard.service';
import { VerifiedUserGuard } from '../core/services/verified-user-guard.service';
import { SharedModule } from '../shared/shared.module';
import { CollectionViewComponent } from './components/collection-view/collection-view.component';
import { CollectionsComponent } from './components/collections/collections.component';
import { PurchaseComponent } from './components/purchase/purchase.component';
import { CollectionItemService } from './services/collection-item.service';
import { SaveCollectionDataGuard } from './services/collection-view-can-deactivate.service';
import { CollectionService } from './services/collection.service';
import { MaterialService } from './services/material.service';
import { PortfolioItemService } from './services/portfolio-item.service';
import { TagService } from './services/tag.service';
import { PurchaseOptionService } from './services/purchase-option.service';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    AuthModule,
    NgbModule.forRoot(),
    NouisliderModule,
    RouterModule.forChild([
      { path: 'start', component: CollectionViewComponent, canActivate: [BetaLoginGuard], canDeactivate: [SaveCollectionDataGuard] },
      { path: 'collections', component: CollectionsComponent, canActivate: [AuthGuard, VerifiedUserGuard] },
      { path: 'collections/:id', component: CollectionViewComponent, canActivate: [AuthGuard, VerifiedUserGuard], canDeactivate: [SaveCollectionDataGuard] },
      { path: 'collections/:id/purchase', component: PurchaseComponent, canActivate: [AuthGuard, VerifiedUserGuard] },
    ]),
  ],
  declarations: [CollectionsComponent, CollectionViewComponent, PurchaseComponent],
  providers: [
    CollectionService,
    CollectionItemService,
    PortfolioItemService,
    TagService,
    MaterialService,
    PurchaseOptionService,
    SaveCollectionDataGuard
  ]
})
export class CollectionModule { }

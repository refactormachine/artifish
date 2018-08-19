import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../../auth/services/auth.service';
import { OrderService } from '../../../payment/services/order.service';
import { PaymentService } from '../../../payment/services/payment.service';
import { AppError } from '../../../shared/models/app-error';
import { CollectionItemService } from '../../services/collection-item.service';
import { CollectionService } from '../../services/collection.service';
import { environment } from '../../../../environments/environment';
import { NotFoundError } from '../../../shared/models/not-found-error';
import { TRANSLATE } from '../../../translation-marker';
import { AlertService } from '../../../shared/services/alert.service';
import { DataService } from '../../../shared/services/data.service';

@Component({
  selector: 'app-purchase',
  templateUrl: './purchase.component.html',
  styleUrls: ['./purchase.component.css']
})
export class PurchaseComponent implements OnInit {
  collection: any;
  collectionItems: any[];
  totalAmountCents: number = 0;
  currencyCode: string;
  isLoading: boolean = false;
  isLoadingPaypal: boolean = false;
  order: any = {};
  selectionPerItemMapping = new Object();

  openModalWindow: boolean = false;
  modalImage: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private collectionService: CollectionService,
    private collectionItemService: CollectionItemService,
    private orderService: OrderService,
    private alertService: AlertService,
    private dataService: DataService,
    private paymentSerivce: PaymentService) { }

  ngOnInit() {
    const component = this;
    this.order.firstName = this.authService.currentUser.first_name;
    this.order.lastName = this.authService.currentUser.last_name;

    let id = this.route.snapshot.paramMap.get('id');
    history.pushState(null, null, window.location.href);
    window.addEventListener('popstate', function (event) {
      component.router.navigate(['/collections/', id]);
      window.location.assign(window.location.href.replace("/purchase", ""));
    });

    this.collectionService.get(id).subscribe(res => {
      this.collection = res;
      this.collectionItemService.getAll(this.collection.id)
        .subscribe(items => {
          this.collectionItems = items;
          if (items.length == 0) {
            this.router.navigate(['/collections', this.collection.id]);
            return;
          }
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            let firstPurchaseOption = item.purchaseOptions[0];

            // Auto select material from list by the filtered selected material from the items search page
            if (this.dataService.data && this.dataService.data.selectedMaterialType) {
              let selectedMaterialType = this.dataService.data.selectedMaterialType;
              for (let i = 0; i < item.purchaseOptions.length; i++) {
                const purchaseOption = item.purchaseOptions[i];
                if (purchaseOption.material == selectedMaterialType) {
                  firstPurchaseOption = purchaseOption;
                  break;
                }
              }
            }

            this.selectionPerItemMapping[item.id] = {
              selectedMaterial: firstPurchaseOption,
              selectedPrice: firstPurchaseOption.prices[0],
              selectedSizeId: firstPurchaseOption.prices[0].sizeId
            };

          }
          this.sumTotalAmount();
          this.currencyCode = items[0].purchaseOptions[0].prices[0].currencyCode;
          this.isLoading = false;
        })
    });
  }

  saveOrder() {
    this.isLoadingPaypal = true;
    let orderItems = [];
    for (let i = 0; i < this.collectionItems.length; i++) {
      const collectionItem = this.collectionItems[i];
      const itemSelections = this.selectionPerItemMapping[collectionItem.id];
      const orderItem = {
        name: collectionItem.name,
        imageUrl: collectionItem.imageUrl,
        purchaseOptionId: itemSelections.selectedPrice.id,
        collectionItemId: collectionItem.id
      }
      orderItems.push(orderItem);
    }
    this.order.itemsAttributes = orderItems;
    this.orderService.create(this.order).subscribe(
      order => {
        this.generatePaypalLink(order.id);
      }, err => this.isLoadingPaypal = false
    );
  }

  materialSelected(collectionItem, materialId) {
    for (let i = 0; i < collectionItem.purchaseOptions.length; i++) {
      const purchaseOption = collectionItem.purchaseOptions[i];
      if (purchaseOption.materialId == materialId) {
        this.selectionPerItemMapping[collectionItem.id].selectedMaterial = purchaseOption
        break;
      }
    }
    this.sizeSelected(collectionItem, this.selectionPerItemMapping[collectionItem.id].selectedPrice.sizeId);
    this.sumTotalAmount();
  }

  sizeSelected(collectionItem, sizeId) {
    let selectedMaterial = this.selectionPerItemMapping[collectionItem.id].selectedMaterial;
    if (!selectedMaterial)
      return;

    for (let i = 0; i < selectedMaterial.prices.length; i++) {
      const priceOption = selectedMaterial.prices[i];
      if (priceOption.sizeId == sizeId) {
        this.selectionPerItemMapping[collectionItem.id].selectedPrice = priceOption;
        break;
      }
    }
    this.sumTotalAmount();
  }

  removeCollectionItem(collectionItem) {
    let index = this.collectionItems.indexOf(collectionItem);
    if (index == -1) return;
    this.collectionItems.splice(index, 1);
    let selectionMapping = this.selectionPerItemMapping[collectionItem.id];
    delete this.selectionPerItemMapping[collectionItem.id];
    this.sumTotalAmount();
    this.collectionItemService.delete(this.collection.id, collectionItem.id).subscribe(
      res => {
        if (this.collectionItems.length == 0) {
          this.router.navigate(['/collections', this.collection.id]);
        }
      },
      (error: AppError) => {
        if (error instanceof NotFoundError) {
          // Do nothing
        } else {
          this.alertService.error(TRANSLATE("purchase.failed_to_remove_item"), false);
          this.collectionItems.splice(index, 0, collectionItem);
          this.selectionPerItemMapping[collectionItem.id] = selectionMapping;
        }
      }
    );
  }

  openImageModal(item) {
    this.modalImage.pop()
    this.modalImage.push({ thumb: item.thumbUrl, img: item.imageUrl, description: item.name });
    this.openModalWindow = true;
  }

  cancelImageModel() {
    this.openModalWindow = false;
  }

  private sumTotalAmount() {
    this.totalAmountCents = 0;
    for (const collectionItemId in this.selectionPerItemMapping) {
      if (this.selectionPerItemMapping.hasOwnProperty(collectionItemId)) {
        const itemSelections = this.selectionPerItemMapping[collectionItemId];
        this.totalAmountCents += itemSelections.selectedPrice.priceCents;
      }
    }
  }

  private generatePaypalLink(orderId) {
    let currentUrl = window.location.href;
    let amount = this.totalAmountCents / 100.0;
    let currencyCode = this.currencyCode;
    let params = {
      // amount: amount,
      orderId: orderId,
      returnUrl: window.location.origin + `${environment.siteVirtualDirectory}/callback/paypal?amount=${amount}&currency_code=${currencyCode}&order=${orderId}&returnUrl=${currentUrl}`,
      cancelReturnUrl: currentUrl
    }
    this.paymentSerivce.generatePaypalLink(params).subscribe(
      res => window.location.href = res['paypal_express_url'],
      (error: AppError) => {
        this.isLoadingPaypal = false;
        throw error;
      }
    )
  };

}

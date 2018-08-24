import 'rxjs/add/observable/forkJoin';

import { Component, EventEmitter, HostListener, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';

import { environment } from '../../../../environments/environment';
import { OAuthAccessDenied, OAuthCanceled } from '../../../auth/models/oauth-errors';
import { AuthService } from '../../../auth/services/auth.service';
import { SkipTourModalContentComponent } from '../../../core/components/skip-tour-modal-content/skip-tour-modal-content.component';
import { UserService } from '../../../core/services/user.service';
import { IntroService } from '../../../intro.service';
import { AppError } from '../../../shared/models/app-error';
import { ValidationError } from '../../../shared/models/validation-error';
import { AlertService } from '../../../shared/services/alert.service';
import { DataService } from '../../../shared/services/data.service';
import { TRANSLATE } from '../../../translation-marker';
import { CollectionViewComponentCanDeactivate } from '../../services/collection-view-can-deactivate.service';
import { CollectionService } from '../../services/collection.service';
import { MaterialService } from '../../services/material.service';
import { PortfolioItemService } from '../../services/portfolio-item.service';
import { TagService } from '../../services/tag.service';
import { PurchaseOptionService } from '../../services/purchase-option.service';
import { ScrollbarComponent } from 'ngx-scrollbar';

@Component({
  selector: 'app-collection-view',
  templateUrl: './collection-view.component.html',
  styleUrls: ['./collection-view.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CollectionViewComponent implements OnInit, CollectionViewComponentCanDeactivate {
  direction: string;
  user: any = {};
  validationErrors = {};

  collection: any = {};
  collectionItems: any[] = [];
  portfolioItems: any[];
  workspacePresets = [{ name: 'bathroom', image: 'Bathroom.jpg' }, { name: 'dress_room', image: 'Dress-room.jpg' }, { name: 'kitchen', image: 'Kitchen.jpg' }, { name: 'living_room', image: 'Living-room.jpg' }, { name: 'living_room', image: 'Living-room-2.jpg' }, { name: 'living_room', image: 'Living-room-3.jpg' }, { name: 'lounge', image: 'Lounge.jpg' }, { name: 'seating_area', image: 'Seating-area.jpg' }, { name: 'seating_area', image: 'Seating-area-2.jpg' }, { name: 'working_room', image: 'Working-room.jpg' }, { name: 'black_wall', image: 'Black-wall.jpg' }, { name: 'blue_wall', image: 'Blue-wall.jpg' }, { name: 'gray_wall', image: 'Gray-wall.jpg' }, { name: 'green_wall', image: 'Green-wall.jpg' }, { name: 'lilac_wall', image: 'Lilac-wall.jpg' }, { name: 'orange_wall', image: 'Orange-wall.jpg' }, { name: 'pink_wall', image: 'Pink-wall.jpg' }, { name: 'purple_wall', image: 'Purple-wall.jpg' }, { name: 'red_wall', image: 'Red-wall.jpg' }, { name: 'white_wall', image: 'White-wall.jpg' }, { name: 'yellow_wall', image: 'Yellow-wall.jpg' }];

  canvasImageDataUrl: string;

  portfolioItemsPage: number = 1;
  portfolioItemsTotalEntries: number;
  portfolioItemsPageSize: number = 40;

  filters: { query: string, tags: any[]; color: string, material: any, size: { width: string, height: string }, minPrice: any, maxPrice: any }
          = { query: null, tags: [], color: null, material: null, size: { width: null, height: null }, minPrice: null, maxPrice: null }
  tags: any[] = [];
  materialTypes: any[] = [];
  hexColors: any[] = ['#bcb7b0', '#000000', '#0c2c53', '#444a6d', '#6f7072', '#8196b5', '#a4c1e2', '#1797b8', '#00a7ed', '#0e59e1', '#2f29e7', '#7327e7', '#c55c9c', '#cd3846', '#e1947f', '#e69f55', '#efd05e', '#ae985d', '#9abe45', '#1ec6b7', '#bdfdfc'];
  selectedMaterialType: any;
  priceRange: any[] = [0];
  maxPrice: string;

  isLoading: boolean = true;
  searchLoading: boolean = true;
  loadingFilters: boolean = true;
  saveLoading: boolean = false;
  purchaseNavigateLoading: boolean = false;
  signupLoading: boolean = false;
  imageLoading: boolean = false;
  loginLoading: boolean = false;

  isEditName: boolean = false;
  unsavedChanges: boolean = false;
  modalErrorMessage: string;
  modalNavigateUrlOnSuccess: string;

  openModalImage: boolean = false;
  openModalCanvas: boolean = false;
  hideCanvas: boolean = true;
  modalImages: any[] = [];
  canvasImages: any[] = [];
  konvaCollection = {konvaImages: [], htmlImages: []};
  collectionItemRemovedEvent = new EventEmitter<any>();

  skipTourModalRef: NgbModalRef;
  introCollectionItems = [{
    portfolioItemId: 0,
    name: 'Sky',
    imageUrl: 'assets/images/tutorial-picture.jpg',
    thumbUrl: 'assets/images/tutorial-picture.jpg',
    startingPriceFormatted: '$550',
  }];

  constructor(
    private alertService: AlertService,
    private router: Router,
    private route: ActivatedRoute,
    private collectionService: CollectionService,
    private portfolioItemService: PortfolioItemService,
    private tagService: TagService,
    private materialService: MaterialService,
    private purchaseOptionService: PurchaseOptionService,
    private dataService: DataService,
    private translate: TranslateService,
    private modalService: NgbModal,
    private userService: UserService,
    private authService: AuthService,
    private introService: IntroService,
  ) {
    this.direction = environment.rtl ? "rtl" : "ltr";
    introService.clickOnDisabledAreaEvent.subscribe(this.clickOnIntroDisabledArea.bind(this));
    if (!this.dataService.data) this.dataService.data = {};
    this.dataService.data.filterSize = this.filters.size;
  }

  @HostListener('window:beforeunload')
  saveCollectionToLocalStorage() {
    return this.handleNavigationAway();
  }

  ngOnInit() {
    this.initializeCollection();
    this.loadCollection();
    this.loadFilters();
    this.portfolioItemService.getRandomly().subscribe(res => {
      this.portfolioItems = res.portfolioItems;
      this.portfolioItemsTotalEntries = res.totalEntries;
      this.searchLoading = false;
    })
  }

  canDeactivate() {
    return this.handleNavigationAway();
  }

  arrowClick(scrollbar: ScrollbarComponent, toLeft) {
    const toMove = 400;
    let scrollLeft = scrollbar.view.scrollLeft + (toLeft ? -toMove : toMove);
    scrollbar.scrollXTo(scrollLeft, 800);
  }

  externalSearch() {
    this.portfolioItemsPage = 1;
    this.searchLoading = true;
    this.portfolioItemService.search(this.filters, this.portfolioItemsPage, this.portfolioItemsPageSize).subscribe(res => {
      this.portfolioItems = res.portfolioItems;
      this.portfolioItemsTotalEntries = res.totalEntries;
      this.searchLoading = false;
    })
  }

  searchByQuery() {
    this.filters.tags = [];
    this.filters.color = null;
    this.externalSearch();
  }

  selectTagFilter(tagObj) {
    let selectedTagIndex = this.filters.tags.indexOf(tagObj);
    if (selectedTagIndex == -1) {
      this.filters.tags.push(tagObj);
    } else {
      this.filters.tags.splice(selectedTagIndex, 1);
    }

    this.externalSearch();
  }

  selectColorFilter(hexColor) {
    this.filters.color = hexColor;
    this.externalSearch();
  }

  selectArtType(materialType) {
    if (this.selectedMaterialType == materialType) return
    this.selectedMaterialType = materialType;
    this.filters.material = materialType;
    this.dataService.data.filterMaterialType = materialType;
    this.externalSearch();
  }

  onPriceRangeChanged() {
    this.filters.minPrice = this.priceRange[0];
    this.filters.maxPrice = this.priceRange[1];
    this.externalSearch();
  }

  pageChanged(event) {
    this.portfolioItems = [];
    this.externalSearch();
    window.scrollTo(0, 0);
  }

  imageSelected(portfolioItem) {
    portfolioItem.selected = portfolioItem.selected === undefined ? true : !portfolioItem.selected
    if (portfolioItem.selected) {
      this.collectionItems.push(portfolioItem);
    } else {
      this.removeCollectionItem(portfolioItem);
    }
    this.unsavedChanges = true;
  }

  removeCollectionItem(portfolioItem, fireEvent = true) {
    let index = this.collectionItems.indexOf(portfolioItem);
    if (index == -1) return;
    this.collectionItems.splice(index, 1);
    this.unsavedChanges = true;
    portfolioItem.selected = false;
    if (fireEvent)
      this.collectionItemRemovedEvent.emit(portfolioItem);
  }

  readURL(event): void {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      const reader = new FileReader();
      reader.onload = e => {
        this.collection.workspaceImageContents = reader.result;
        this.collection.workspaceImageUrl = reader.result;
        this.collection.workspaceImageBareContents = reader.result;
        this.collection.workspaceImageBareUrl = reader.result;

        this.canvasImageDataUrl = null;
        this.clearCollectionItemsPositions();

        this.imageLoading = false;
      };

      this.imageLoading = true;
      reader.readAsDataURL(file);
      this.unsavedChanges = true;
    }
  }

  onBlurCollectionName() {
    this.unsavedChanges = true;
    this.editName(false);
    this.updateCollectionName();
  }

  editName(isEditName) {
    this.isEditName = isEditName;
  }

  clearCollection(force: boolean = false) {
    this.translate.get(TRANSLATE("collection.clear_collection_alert")).subscribe(translation => {
      if (!force && !confirm(translation))
        return;

      localStorage.removeItem('collectionData');
      this.initializeCollection();
      this.dataService.data.collectionData = {
        collection: this.collection,
        collectionItems: this.collectionItems,
        selectedMaterialType: this.selectedMaterialType
      };
    });
  }

  saveCollection(saveModal) {
    if (this.authService.isLoggedIn()) {
      this.saveLoading = true;
      this.saveCollectionToServer('/collections/');
    } else {
      this.modalNavigateUrlOnSuccess = '/collections/';
      this.openModal(saveModal);
    }
  }

  saveCollectionToServer(navigateUrlOnSuccess: string, closeModalCallback: () => void = null) {
    let collectionId = this.route.snapshot.paramMap.get('id');
    this.collection.itemsAttributes = this.collectionItems;
    if (collectionId) {
      this.collectionService.update(this.collection)
        .subscribe(res => {
          this.collection = res;
          this.collectionItems = this.collection.items;
          this.alertService.success(TRANSLATE('collection.collection_was_saved'), true);
          this.saveLoading = false;
          this.purchaseNavigateLoading = false;
          this.unsavedChanges = false;
          if (navigateUrlOnSuccess == 'purchase') {
            this.router.navigate(['/collections/', collectionId, 'purchase']);
          } else {
            this.router.navigate([navigateUrlOnSuccess]);
          }
          if (closeModalCallback) closeModalCallback();
        }, (error: AppError) => {
          this.alertService.error(TRANSLATE('collection.error_saving_collection'));
          this.purchaseNavigateLoading = false;
          this.saveLoading = false;
          this.loginLoading = false;
          if (closeModalCallback) closeModalCallback();
        });
    } else {
      this.collectionService.create(this.collection)
        .subscribe(res => {
          this.collection = res;
          this.collectionItems = this.collection.items;
          this.alertService.success(TRANSLATE('collection.collection_was_saved'), true);
          this.saveLoading = false;
          this.purchaseNavigateLoading = false;
          this.clearCollection(true);
          this.unsavedChanges = false;
          if (navigateUrlOnSuccess == 'purchase') {
            this.router.navigate(['/collections/', res.id, 'purchase']);
          } else {
            this.router.navigate([navigateUrlOnSuccess]);
          }
          if (closeModalCallback) closeModalCallback();
        }, (error: AppError) => {
          this.alertService.error(TRANSLATE('collection.error_saving_collection'));
          this.saveLoading = false;
          this.purchaseNavigateLoading = false;
          this.loginLoading = false;
          if (closeModalCallback) closeModalCallback();
        });
    }

  }

  openModal(content, options = {}) {
    this.modalService.open(content, options);
  }

  signupAndSaveCollection(closeModalCallback: () => void) {
    this.signupLoading = true;
    this.userService.create(this.user)
      .subscribe(
        data => {
          localStorage.setItem("token", data['auth_token']);
          this.saveCollectionToServer(this.modalNavigateUrlOnSuccess, closeModalCallback);
        },
        (error: AppError) => {
          this.signupLoading = false;
          if (error instanceof ValidationError) {
            this.validationErrors = error.validations;
            this.modalErrorMessage = TRANSLATE("sign_up.some_of_the_input_fields_are_invalid");
          } else throw error;
        }
      );
  }

  navigateToPurchase(saveModal) {
    if (this.authService.isLoggedIn()) {
      let collectionId = this.route.snapshot.paramMap.get('id');
      if (this.unsavedChanges) {
        this.saveLoading = true;
        this.purchaseNavigateLoading = true;
        this.saveCollectionToServer('purchase');
      } else {
        this.router.navigate(['/collections/', collectionId, 'purchase']);
      }
    } else {
      this.modalNavigateUrlOnSuccess = 'purchase';
      this.openModal(saveModal);
    }
  }

  updateCollectionName() {
    let collectionId = this.route.snapshot.paramMap.get('id');
    if (collectionId) {
      this.collectionService.update({ id: this.collection.id, name: this.collection.name })
        .subscribe();
    }
  }

  isTagSelected(tag) {
    return this.filters.tags.indexOf(tag) != -1;
  }

  openImageModal(item) {
    this.modalImages.pop()
    this.modalImages.push({ thumb: item.thumbUrl, img: item.imageUrl, description: item.name });
    this.openModalImage = true;
  }

  openCanvasModal() {
    this.unsavedChanges = true;
    this.recreateCanvas(true);
    this.hideCanvas = false;
  }

  recreateCanvas(useAllCollectionItems = false) {
    if (!this.canvasImageDataUrl && !this.collection.workspaceImageUrl)
      return;
    this.openModalCanvas = false; // destroy canvas
    setTimeout(() => {
      this.openModalCanvas = true; // and recreate canvas
      this.canvasImages = [];
      for (let i = 0; i < this.collectionItems.length; i++) {
        const item = this.collectionItems[i];
        if (!useAllCollectionItems && !item.positionAttributes) continue; // skip items that were never positioned in canvas unless called with useAllCollectionItems set to true
        this.canvasImages.push({ img: item.imageUrl, positionAttributes: item.positionAttributes || {}, collectionItem: item });
      }
    }, 100);
  }

  closeImageModal() {
    this.openModalImage = false;
  }

  closeCanvasModal(canvasImageDataUrl) {
    this.hideCanvas = true;
    if (canvasImageDataUrl) {
      this.canvasImageDataUrl = canvasImageDataUrl;
      this.collection.workspaceImageContents = canvasImageDataUrl;
      this.collection.workspaceImageUrl = canvasImageDataUrl;
    }
  }

  loginWithGooglePopup(closeModalCallback: () => void) {
    this.loginLoading = true;
    this.loginWithPopup(this.authService.loginWithGooglePopup(), closeModalCallback);
  }

  loginWithFacebookPopup(closeModalCallback: () => void) {
    this.loginLoading = true;
    this.loginWithPopup(this.authService.loginWithFacebookPopup(), closeModalCallback);
  }

  selectWorkspacePreset(workspacePreset) {
    let imageUrl = "assets/images/workspace-presets/" + workspacePreset.image;
    this.imageLoading = true;
    this.convertImageToBase64(imageUrl).then(dataUrl => {
      this.collection.workspaceImageUrl = imageUrl;
      this.collection.workspaceImageContents = dataUrl;
      this.collection.workspaceImageBareUrl = imageUrl;
      this.collection.workspaceImageBareContents = dataUrl;
      this.canvasImageDataUrl = null;
      this.imageLoading = false;
    })
  }

  private clearCollectionItemsPositions() {
    for (let i = 0; i < this.collectionItems.length; i++) {
      const item = this.collectionItems[i];
      item.positionAttributes = {};
    }
  }

  private initializeCollection() {
    this.collection = {};
    this.canvasImageDataUrl = null;
    if (this.collectionItems.length > 0) {
      for (let i = 0; i < this.collectionItems.length; i++) {
        const item = this.collectionItems[i];
        item.selected = false;
      }
    }
    this.collectionItems = [];
    this.unsavedChanges = false;
    this.translate.get(TRANSLATE('collection.my_project')).subscribe(res => {
      this.collection.name = this.collection.name || res;
    });
  }

  private loadCollection() {
    let collectionId = this.route.snapshot.paramMap.get('id');
    if (collectionId) {
      this.collectionService.get(collectionId).subscribe(res => {
        this.collection = res;
        this.collectionItems = res.items;
        this.recreateCanvas();
        this.isLoading = false;
      }, error => {
        this.router.navigate(['/collections']);
      });
    } else {
      this.loadCollectionFromLocalStorage();
      this.isLoading = false;
    }
  }

  private loadCollectionFromLocalStorage() {
    let collectionData: any = localStorage.getItem('collectionData');
    if (!collectionData || collectionData.indexOf('"collection":') == -1) {
      collectionData = {
        collection: this.collection,
        collectionItems: this.collectionItems
      };
    } else {
      collectionData = JSON.parse(collectionData);
      this.collection = collectionData.collection;
      this.collectionItems = collectionData.collectionItems;
      for (let i = 0; i < this.collectionItems.length; i++) {
        const item = this.collectionItems[i];
      }
    }
    this.dataService.data.collectionData = collectionData;
    this.recreateCanvas();
  }

  private loadFilters() {
    Observable.forkJoin(
      this.tagService.getAll(),
      this.materialService.getAll(),
      this.purchaseOptionService.getMaxPrice()
    ).subscribe(res => {
      this.tags = res[0];
      this.setMaterials(res[1]);
      this.maxPrice = res[2]['max_price_rounded'];
      this.priceRange = [0, this.maxPrice];
      this.loadingFilters = false;
      this.startTourIfRequested();
    });
  }

  private setMaterials(materials) {
    for (let i = 0; i < materials.length; i++) {
      const materialObj = materials[i];
      if (this.materialTypes.indexOf(materialObj.materialType) == -1)
        this.materialTypes.push(materialObj.materialType);
    }
    if (this.materialTypes.length == 1) this.selectedMaterialType = this.materialTypes[0];
  }

  private startTourIfRequested() {
    if (this.dataService.data.startWithTour) {
      setTimeout(() => {
        this.dataService.data.startWithTour = false;
        this.introService.startTour();
      }, 100);
    }
  }

  private handleNavigationAway() {
    if (this.authService.isLoggedIn() && this.unsavedChanges) {
      return confirm(this.translate.instant(TRANSLATE("collection.discard_unsaved_changes")));
    } else {
      if (this.dataService.data.collectionData) {
        try {
          localStorage.setItem('collectionData', JSON.stringify(this.dataService.data.collectionData));
        } catch (error) {
          // Happens when choosing to big image as workspace image. Don't save in local storage in that case
        }
      }
      return true;
    }
  }

  private loginWithPopup(login$: Observable<void>, closeModalCallback: () => void) {
    login$.subscribe(
      () => {
        this.saveCollectionToServer(this.modalNavigateUrlOnSuccess, closeModalCallback);
      },
      error => {
        this.loginLoading = false;
        if (error instanceof OAuthAccessDenied ||
          error instanceof OAuthCanceled) {
          this.alertService.error('You must grant permissions to this application in order to login');
        } else throw error
      }
    );
  }

  private clickOnIntroDisabledArea(step: number) {
    if (this.skipTourModalRef) return;
    this.skipTourModalRef = this.modalService.open(SkipTourModalContentComponent, { backdropClass: 'd-none', windowClass: 'ontop-overlay' });
    this.skipTourModalRef.result.catch(res => this.skipTourModalRef = null);
    const closeModal = () => {
      if (!this.skipTourModalRef) return;
      this.skipTourModalRef.close("Closed Intro Tour");
      this.skipTourModalRef = null;
    }
    this.introService.addOnExitCallback(closeModal);
    this.introService.addOnEndCallback(closeModal);
    this.introService.addOnChangeCallback(closeModal);
  }

  private convertImageToBase64(imageUrl) {
    return new Promise((resolve, reject) => {
      var xmlHTTP = new XMLHttpRequest();
      xmlHTTP.open('GET', imageUrl, true);
      xmlHTTP.responseType = 'arraybuffer';
      xmlHTTP.onload = function (e) {
        var b64 = btoa(new Uint8Array((e.target as XMLHttpRequest).response).reduce(function (data, byte) {
          return data + String.fromCharCode(byte);
        }, ''));

        var dataURL = "data:image/jpeg;base64," + b64;
        resolve(dataURL);
      };
      xmlHTTP.send();
    });
  }

  downloadWorkspaceImage() {
    var link = document.createElement("a");
    link.download = this.collection.name + ".jpg";
    link.href = this.canvasImageDataUrl || this.collection.workspaceImageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

}

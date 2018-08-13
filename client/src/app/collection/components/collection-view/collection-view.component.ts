import * as Konva from 'konva';
import { Component, HostListener, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { AuthService } from '../../../auth/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { AppError } from '../../../shared/models/app-error';
import { ValidationError } from '../../../shared/models/validation-error';
import { AlertService } from '../../../shared/services/alert.service';
import { DataService } from '../../../shared/services/data.service';
import { TRANSLATE } from '../../../translation-marker';
import { CollectionViewComponentCanDeactivate } from '../../services/collection-view-can-deactivate.service';
import { CollectionService } from '../../services/collection.service';
import { PortfolioItemService } from '../../services/portfolio-item.service';
import { TagService } from '../../services/tag.service';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { OAuthAccessDenied, OAuthCanceled } from '../../../auth/models/oauth-errors';
import { MaterialService } from '../../services/material.service';
import { IntroService } from '../../../intro.service';

@Component({
  selector: 'app-collection-view',
  templateUrl: './collection-view.component.html',
  styleUrls: ['./collection-view.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CollectionViewComponent implements OnInit, CollectionViewComponentCanDeactivate {
  direction: string;
  user: any = {};
  validationErrors = {};

  collection: any = {};
  collectionItems: any[] = [];
  portfolioItems: any[];

  canvasImageDataUrl: string;

  portfolioItemsPage: number = 1;
  portfolioItemsTotalEntries: number;
  portfolioItemsPageSize: number = 40;

  filters: { tags: any[]; color: string, material: any } = { tags: [], color: null, material: null }
  tags: any[] = [];
  materialTypes: any[] = [];
  hexColors: any[] = ['#bcb7b0', '#000000', '#0c2c53', '#444a6d', '#1797b8', '#00a7ed', '#0e59e1', '#2f29e7', '#7327e7', '#c55c9c', '#cd3846', '#e1947f', '#e69f55', '#efd05e', '#9abe45', '#1ec6b7', '#bdfdfc'];//, '#ff0000', '#00ff00', '#0000ff']
  selectedMaterialType: any;

  isLoading: boolean = true;
  searchLoading: boolean = true;
  saveLoading: boolean = false;
  purchaseNavigateLoading: boolean = false;
  signupLoading: boolean = false;
  imageLoading: boolean = false;
  loadingTags: boolean = true;
  loginLoading: boolean = false;

  isEditName: boolean = false;
  unsavedChanges: boolean = false;
  modalErrorMessage: string;
  modalNavigateUrlOnSuccess: string;

  openModalImage: boolean = false;
  openModalCanvas: boolean = false;
  modalImages: any[] = [];
  canvasImages: any[] = [];
  konvaCollection = {konvaImages: [], htmlImages: []}

  introCollectionItems = [{
      portfolioItemId: 0,
      name: 'mona lisa',
      imageUrl: 'https://images.unsplash.com/photo-1534066519516-fc7b4cc6062c?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=1cbedfe74f1e132ff945107d641056ba&auto=format&fit=crop&w=500&q=60',
      thumbUrl: 'https://images.unsplash.com/photo-1534066519516-fc7b4cc6062c?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=1cbedfe74f1e132ff945107d641056ba&auto=format&fit=crop&w=500&q=60',
      startingPriceFormatted: '₪550',
    }];
  
  constructor(
    private alertService: AlertService,
    private router: Router,
    private route: ActivatedRoute,
    private collectionService: CollectionService,
    private portfolioItemService: PortfolioItemService,
    private tagService: TagService,
    private materialService: MaterialService,
    private dataService: DataService,
    private translate: TranslateService,
    private modalService: NgbModal,
    private userService: UserService,
    private authService: AuthService,
    private introService: IntroService,
  ) {
    this.direction = environment.rtl ? "rtl" : "ltr";
  }

  @HostListener('window:beforeunload')
  saveCollectionToLocalStorage() {
    return this.handleNavigationAway();
  }

  ngOnInit() {
    this.newVersionInitialization();
    this.initializeCollection();
    this.loadCollection();
    this.loadTags();
    this.loadMaterials();
    this.portfolioItemService.getRandomly().subscribe(res => {
      this.portfolioItems = res.portfolioItems;
      this.portfolioItemsTotalEntries = res.totalEntries;
      this.searchLoading = false;
    })
  }

  canDeactivate() {
    this.collectionItems.push({thumbUrl: "url"})
    return this.handleNavigationAway();
  }

  arrowClick(toLeft) {
    const toMove = 400;
    document.getElementById('tagList').scrollLeft += toLeft ? -toMove : toMove;
  }

  externalSearch() {
    this.searchLoading = true;
    this.portfolioItemService.search(this.filters, this.portfolioItemsPage, this.portfolioItemsPageSize).subscribe(res => {
      this.portfolioItems = res.portfolioItems;
      this.portfolioItemsTotalEntries = res.totalEntries;
      this.searchLoading = false;
    })
  }

  selectTagFilter(tagObj) {
    this.portfolioItemsPage = 1;
    let selectedTagIndex = this.filters.tags.indexOf(tagObj);
    if (selectedTagIndex == -1) {
      this.filters.tags.push(tagObj);
    } else {
      this.filters.tags.splice(selectedTagIndex, 1);
    }

    this.externalSearch();
  }

  selectColorFilter(hexColor) {
    this.portfolioItemsPage = 1;
    if (this.filters.color == hexColor) {
      this.filters.color = null;
    } else {
      this.filters.color = hexColor;
    }

    this.externalSearch();
  }

  selectArtType(materialType) {
    if (this.selectedMaterialType == materialType) return
    this.selectedMaterialType = materialType;
    this.filters.material = materialType;
    this.dataService.data.selectedMaterialType = materialType;
    this.externalSearch();
  }

  pageChanged(event) {
    this.portfolioItems = [];
    this.externalSearch();
  }

  imageSelected(portfolioItem) {
    portfolioItem.selected = portfolioItem.selected === undefined ? true : !portfolioItem.selected
    if (portfolioItem.selected) {
      this.collectionItems.push(portfolioItem);
    } else {
      this.removeCollectionItemById(portfolioItem);
    }
    this.unsavedChanges = true;
  }

  removeCollectionItemById(portfolioItem) {
    let index = this.collectionItems.indexOf(portfolioItem);
    if (index == -1) return;
    this.collectionItems.splice(index, 1);
    this.unsavedChanges = true;
    portfolioItem.selected = false;
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

  saveCollectionToServer(navigateUrlOnSuccess: string) {
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
        }, (error: AppError) => {
          this.alertService.error(TRANSLATE('collection.error_saving_collection'));
          this.purchaseNavigateLoading = false;
          this.saveLoading = false;
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
        }, (error: AppError) => {
          this.alertService.error(TRANSLATE('collection.error_saving_collection'));
          this.saveLoading = false;
          this.purchaseNavigateLoading = false;
        });
    }

  }

  openModal(content) {
    this.modalService.open(content);
  }

  signupAndSaveCollection(callback: () => void) {
    this.signupLoading = true;
    this.userService.create(this.user)
      .subscribe(
        data => {
          callback();
          localStorage.setItem("token", data['auth_token']);
          this.saveCollectionToServer(this.modalNavigateUrlOnSuccess);
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
    this.canvasImages = [];
    for (let i = 0; i < this.collectionItems.length; i++) {
      const item = this.collectionItems[i];
      this.canvasImages.push({ img: item.imageUrl, positionAttributes: item.positionAttributes || {}, collectionItem: item });
    }
    this.openModalCanvas = true;
  }

  closeImageModal() {
    this.openModalImage = false;
  }

  closeCanvasModal(canvasImageDataUrl) {
    this.openModalCanvas = false;
    this.canvasImageDataUrl = canvasImageDataUrl;
    this.collection.workspaceImageContents = canvasImageDataUrl;
  }

  loginWithGooglePopup(callback: () => void) {
    this.loginLoading = true;
    this.loginWithPopup(this.authService.loginWithGooglePopup(), callback);
  }

  loginWithFacebookPopup(callback: () => void) {
    this.loginLoading = true;
    this.loginWithPopup(this.authService.loginWithFacebookPopup(), callback);
  }

  private clearCollectionItemsPositions() {
    for (let i = 0; i < this.collectionItems.length; i++) {
      const item = this.collectionItems[i];
      item.positionAttributes = {};
    }
  }

  private newVersionInitialization() {
    if (localStorage.getItem('version') !== 'v1') {
      localStorage.clear();
    }
    localStorage.setItem('version', 'v1');
  }

  private initializeCollection() {
    this.collection = {};
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
  }

  private loadTags() {
    this.tagService.getAll().subscribe(res => {
      this.tags = res;
      this.loadingTags = false;
    });
  }

  private loadMaterials() {
    this.materialService.getAll().subscribe(res => {
      for (let i = 0; i < res.length; i++) {
        const materialObj = res[i];
        if (this.materialTypes.indexOf(materialObj.materialType) == -1)
          this.materialTypes.push(materialObj.materialType);
      }
      if (this.materialTypes.length == 1) this.selectedMaterialType = this.materialTypes[0];
      this.loadingTags = false;
    });
  }

  private handleNavigationAway() {
    if (this.authService.isLoggedIn() && this.unsavedChanges) {
      return confirm(this.translate.instant(TRANSLATE("collection.discard_unsaved_changes")));
    } else {
      if (this.dataService.data.collectionData) {
        localStorage.setItem('collectionData', JSON.stringify(this.dataService.data.collectionData));
      }
      return true;
    }
  }

  private loginWithPopup(login$: Observable<void>, callback: () => void) {
    login$.subscribe(
      () => {
        this.loginLoading = false;
        callback();
        this.saveCollectionToServer(this.modalNavigateUrlOnSuccess);
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
}

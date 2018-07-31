import { Component, HostListener, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-collection-view',
  templateUrl: './collection-view.component.html',
  styleUrls: ['./collection-view.component.css']
})
export class CollectionViewComponent implements OnInit, CollectionViewComponentCanDeactivate {
  user: any = {};
  validationErrors = {};

  collection: any = {};
  collectionItems: any[] = [];
  portfolioItems: any[];
  filters: { tags: any[]; color: string } = { tags: [], color: null}
  tags: any[];
  hexColors: any[] = ['#bcb7b0', '#000000', '#0c2c53', '#444a6d', '#1797b8', '#00a7ed', '#0e59e1', '#2f29e7', '#7327e7', '#c55c9c', '#cd3846', '#e1947f', '#e69f55', '#efd05e', '#9abe45', '#1ec6b7', '#bdfdfc'];//, '#ff0000', '#00ff00', '#0000ff']

  isLoading: boolean = true;
  searchLoading: boolean = false;
  saveLoading: boolean = false;
  signupLoading: boolean = false;
  imageLoading: boolean = false;
  loadingTags: boolean = true;

  isEditName: boolean = false;
  unsavedChanges: boolean = false;
  modalErrorMessage: string;
  modalNavigateUrlOnSuccess: string;

  constructor(
    private alertService: AlertService,
    private router: Router,
    private route: ActivatedRoute,
    private collectionService: CollectionService,
    private portfolioItemService: PortfolioItemService,
    private tagService: TagService,
    private dataService: DataService,
    private translate: TranslateService,
    private modalService: NgbModal,
    private userService: UserService,
    private authService: AuthService) {
      this.initializeCollection();
    }

  @HostListener('window:beforeunload')
  saveCollectionToLocalStorage() {
    return this.handleNavigationAway();
  }

  ngOnInit() {
    this.loadCollection();
    this.loadTags();
  }

  canDeactivate() {
    return this.handleNavigationAway();
  }

  arrowClick(toLeft) {
    const toMove = 500;
    document.getElementById('tagList').scrollLeft += toLeft ? -toMove : toMove;
  }

  externalSearch() {
    this.searchLoading = true;
    this.portfolioItemService.search(this.filters).subscribe(res => {
      this.portfolioItems = res;
      this.searchLoading = false;
    })
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
    if (this.filters.color == hexColor) {
      this.filters.color = null;
    } else {
      this.filters.color = hexColor;
    }

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
  }

  readURL(event): void {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      const reader = new FileReader();
      reader.onload = e => {
        this.collection.workspaceImageContents = reader.result;
        this.collection.workspaceImageUrl = reader.result;
        this.imageLoading = false;
      };

      this.imageLoading = true;
      reader.readAsDataURL(file);
      this.unsavedChanges = true;
    }
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
      this.dataService.data = {
        collection: this.collection,
        collectionItems: this.collectionItems
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
          this.alertService.success(TRANSLATE('collection.collection_was_saved'));
          this.saveLoading = false;
          this.unsavedChanges = false;
          this.router.navigate([navigateUrlOnSuccess]);
        }, (error: AppError) => {
          this.alertService.error(TRANSLATE('collection.error_saving_collection'));
          this.saveLoading = false;
        });
    } else {
      this.collectionService.create(this.collection)
        .subscribe(res => {
          this.collection = res;
          this.collectionItems = this.collection.items;
          this.alertService.success(TRANSLATE('collection.collection_was_saved'), true);
          this.saveLoading = false;
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
      if (collectionId) {
        this.router.navigate(['/collections/', collectionId, 'purchase']);
      } else {
        this.saveLoading = true;
        this.saveCollectionToServer('purchase');
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

  private initializeCollection() {
    this.collection = {name: "My Space"};
    this.collectionItems = [];
    this.unsavedChanges = false;
  }

  private loadCollection() {
    let collectionId = this.route.snapshot.paramMap.get('id');
    if (collectionId) {
      this.collectionService.get(collectionId).subscribe(res => {
        this.collection = res;
        this.collectionItems = res.items;
        this.isLoading = false;
      });
    } else {
      this.loadCollectionFromLocalStorage();
      this.isLoading = false;
    }
  }

  private loadCollectionFromLocalStorage() {
    let data: any = localStorage.getItem('collectionData');
    if (!data || data.indexOf('"collection":') == 0) {
      data = {
        collection: this.collection,
        collectionItems: this.collectionItems
      };
    } else {
      data = JSON.parse(data);
      this.collection = data.collection;
      this.collectionItems = data.collectionItems;
    }
    this.dataService.data = data
  }

  private loadTags() {
    this.tags = []
    this.tagService.getAll().subscribe(res => {
      this.tags = res;
      this.loadingTags = false;
    });
  }

  private handleNavigationAway() {
    if (this.authService.isLoggedIn() && this.unsavedChanges) {
      return confirm(this.translate.instant(TRANSLATE("collection.discard_unsaved_changes")));
    } else {
      if (this.dataService.data) {
        localStorage.setItem('collectionData', JSON.stringify(this.dataService.data));
      }
      return true;
    }
  }
}

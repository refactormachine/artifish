import {Component, Input,Output,ElementRef,EventEmitter,OnInit, AfterViewChecked, AfterViewInit} from '@angular/core';
import * as Konva from 'konva';

@Component({
  selector: 'CanvasModal',
  template: `
  <div class="ng-canvas-overlay">
    <div class="ng-canvas-content">
      <div class="uil-ring-css" *ngIf="loading"><div></div></div>
      <div [ngClass]="{ 'd-none': loading }" style="background-color: #ededed;" id="canvasContainer"></div>
      <a class="canvas-button close-popup" (click)="closeCanvas()"><i class="fa fa-close"></i></a>
      <a *ngIf="showImageButtons" class="canvas-button delete-image" (click)="deleteImage()"><i class="fa fa-trash"></i></a>
    </div>
  </div>
       `
})
export class CanvasModalComponent implements AfterViewInit {
  public _element: any;
  public opened: boolean = false;
  private konvaCollection = { konvaImages: [], htmlImages: [] }
  private konvaImagesToCollectionItem: Map<Konva.Image, any> = new Map<Konva.Image, any>();
  private stage: Konva.Stage;
  private layer: Konva.Layer;
  public loading: boolean = true;
  public showImageButtons: boolean = false;
  private selectedKonvaImage: Konva.Image;

  @Input('backgroundImage') public backgroundImage: any;
  @Input('modalImages') public modalImages: any;
  @Input('collectionItemRemovedEvent') public collectionItemRemovedEvent: EventEmitter<any>;
  @Output('cancelEvent') cancelEvent = new EventEmitter<any>();
  @Output('deleteImage') deleteImageEvent = new EventEmitter<any>();
  constructor(public element: ElementRef) {
    this._element = this.element.nativeElement;
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.loadBackgroundImage();
    }, 200);
    this.collectionItemRemovedEvent.subscribe(this.removeCollectionItem.bind(this));
  }
  closeCanvas() {
    this.opened = false;
    if (this.stage) {
      this.destroyTransformer();
      let canvas = document.getElementsByTagName("canvas")[0]
      var jpegUrl = canvas.toDataURL("image/jpeg");
      this.cancelEvent.emit(jpegUrl);
    } else {
      this.cancelEvent.emit(null);
    }
  }

  deleteImage() {
    const collectionItem = this.konvaImagesToCollectionItem.get(this.selectedKonvaImage);
    this.selectedKonvaImage.destroy();
    this.destroyTransformer();
    this.layer.draw();

    this.deleteImageEvent.emit(collectionItem);
  }

  removeCollectionItem(collectionItem) {
    this.konvaImagesToCollectionItem.forEach((item, konvaImage) => {
      if (item == collectionItem) {
        konvaImage.destroy();
        this.closeCanvas();
        return;
      }
    })
  }

  private loadBackgroundImage() {
    let self = this;
    var workspaceImageObj = new Image();
    workspaceImageObj.onload = function (e) {
      self.openCanvas(e.target as HTMLImageElement);
    };
    workspaceImageObj.crossOrigin = "anonymous"
    workspaceImageObj.src = this.backgroundImage;
  }

  private openCanvas(workspaceImageObj: HTMLImageElement) {
    this.konvaCollection = { konvaImages: [], htmlImages: [] };

    let cWidth = window.innerWidth;
    let cHeight = window.innerHeight;
    let iWidth = workspaceImageObj.width;
    let iHeight = workspaceImageObj.height;

    var ratio = Math.min(cWidth / iWidth, cHeight / iHeight);
    let width = iWidth * ratio;
    let height = iHeight * ratio;
    var centerY = (cHeight - iHeight * ratio) / 2;

    let stage = new Konva.Stage({
      container: 'canvasContainer',
      width: width,
      height: height
    });
    this.stage = stage;

    let layer = new Konva.Layer();
    this.layer = layer;
    stage.add(layer);

    var workspaceImage = new Konva.Image({
      width: width,
      height: height,
      name: 'workspaceImage',
      image: workspaceImageObj
    });
    layer.add(workspaceImage);
    layer.draw();

    let loadedImages = 0;
    if (this.modalImages.length == 0) this.loading = false
    let x = 60;
    let y = 60;
    let imageIndex = 0;
    for (let i = 0; i < this.modalImages.length; i++) {
      const modalImage = this.modalImages[i];
      const positionAttributes = modalImage.positionAttributes;
      if (!positionAttributes.x) {
        x = 60 + (100 * imageIndex);
        imageIndex++;
        if (x > width - 100) {
          x = 60;
          y += 150;
          imageIndex = 0;
        }
      }
      var konvaImage = new Konva.Image({
        x: positionAttributes.x || x,
        y: positionAttributes.y || y,
        scaleX: positionAttributes.scaleX || 1,
        scaleY: positionAttributes.scaleY || 1,
        rotation: positionAttributes.rotation || 0,
        name: 'image',
        draggable: true,
        shadowColor: 'black',
        shadowBlur: 9,
        shadowOffset: { x: 0, y: 2 },
        shadowOpacity: 0.25,
        image: new Image()
      });
      konvaImage.on('dragmove', function(e) {
        self.savePositionAttributes(modalImage, e.target.getAttrs());
      });
      konvaImage.on('transformend', function(e) {
        self.savePositionAttributes(modalImage, e.target.getAttrs());
      })
      konvaImage.on('mouseenter', function () {
        stage.container().style.cursor = 'pointer';
      });
      konvaImage.on('mouseleave', function () {
        stage.container().style.cursor = 'default';
      });

      let self = this;
      this.konvaCollection.konvaImages.push(konvaImage);
      this.konvaImagesToCollectionItem.set(konvaImage, modalImage.collectionItem);
      this.savePositionAttributes(modalImage, positionAttributes || {});
      layer.add(konvaImage);
      var imageObj = new Image();
      imageObj.onload = function (e) {
        let konvaImage = self.konvaCollection.konvaImages[i]
        konvaImage.image(self.konvaCollection.htmlImages[i]);
        let imgWidth = (e.target as HTMLImageElement).width;
        let imgHeight = (e.target as HTMLImageElement).height;
        let ratio = 75.0 / imgWidth
        konvaImage.width(imgWidth * ratio);
        konvaImage.height(imgHeight * ratio);
        layer.draw();
        loadedImages++;
        if (loadedImages == self.modalImages.length) { // When done loading last image
          self.createTransformer(konvaImage);
          self.loading = false;
        }
      };
      imageObj.crossOrigin = "anonymous"
      imageObj.src = this.modalImages[i].img;
      this.konvaCollection.htmlImages.push(imageObj);
    }

    let onStageClickOrTap = function (e) {
      // if click on empty area - remove all transformers
      if ((e.target as any) === stage || e.target.hasName('workspaceImage')) {
        this.destroyTransformer();
        return;
      }
      // do nothing if clicked NOT on our rectangles
      if (!e.target.hasName('image')) {
        return;
      }
      // remove old transformers
      // TODO: we can skip it if current rect is already selected
      this.destroyTransformer();

      // create new transformer
      this.createTransformer(e.target);
    }.bind(this);
    stage.on('click', onStageClickOrTap);
    stage.on('tap', onStageClickOrTap);

    let konvaContent = document.getElementsByClassName("konvajs-content");
    (konvaContent[0] as any).style.top = `${centerY}px`;
  }

  savePositionAttributes(modalImage, konvaImageAttrs: Konva.NodeConfig) {
    modalImage.collectionItem.positionAttributes = {
      x: konvaImageAttrs.x,
      y: konvaImageAttrs.y,
      scaleX: konvaImageAttrs.scaleX,
      scaleY: konvaImageAttrs.scaleY,
      rotation: konvaImageAttrs.rotation
    }
  }

  private createTransformer(konvaImage) {
    var tr = new Konva.Transformer({
      enabledHandlers: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      rotationSnaps: [0, 90, 180, 270],
      boundBoxFunc: function (oldBox, newBox) {
        if (newBox.width > 400) {
          return oldBox;
        }
        return newBox;
      }
    });
    this.layer.add(tr);
    tr.attachTo(konvaImage);
    this.layer.draw();
    this.selectedKonvaImage = konvaImage;
    this.showButtons();
  }

  private destroyTransformer() {
    this.stage.find('Transformer').destroy();
    this.layer.draw();
    this.selectedKonvaImage = null;
    this.hideButtons();
  }

  private showButtons() {
    this.showImageButtons = true;
  }

  private hideButtons() {
    this.showImageButtons = false;
  }
}

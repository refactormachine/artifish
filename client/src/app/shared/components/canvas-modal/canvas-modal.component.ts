import {Component, Input,Output,ElementRef,EventEmitter,OnInit, AfterViewChecked, AfterViewInit} from '@angular/core';
import * as Konva from 'konva';

@Component({
  selector: 'CanvasModal',
  template: `
  <div class="ng-canvas-overlay">
    <div class="ng-canvas-content">
      <div class="uil-ring-css" *ngIf="loading"><div></div></div>
      <div [ngClass]="{ 'd-none': loading }" style="background-color: #ededed;" id="canvasContainer"></div>
      <a class="close-popup" (click)="closeCanvas()"><i class="fa fa-close"></i></a>
    </div>
  </div>
       `
})
export class CanvasModalComponent implements OnInit {
  public _element: any;
  public opened: boolean = false;
  private konvaCollection = { konvaImages: [], htmlImages: [] }
  private stage: Konva.Stage;
  public loading: boolean = true;

  @Input('backgroundImage') public backgroundImage: any;
  @Input('modalImages') public modalImages: any;
  @Output('cancelEvent') cancelEvent = new EventEmitter<any>();
  constructor(public element: ElementRef) {
    this._element = this.element.nativeElement;
  }
  ngOnInit() {
    setTimeout(() => {
      this.loadBackgroundImage();
    }, 200);
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

    var layer = new Konva.Layer();
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
          self.createTransformer(layer, konvaImage);
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
        stage.find('Transformer').destroy();
        layer.draw();
        return;
      }
      // do nothing if clicked NOT on our rectangles
      if (!e.target.hasName('image')) {
        return;
      }
      // remove old transformers
      // TODO: we can skip it if current rect is already selected
      stage.find('Transformer').destroy();

      // create new transformer
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
      layer.add(tr);
      tr.attachTo(e.target);
      layer.draw();
    };
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

  private createTransformer(layer, konvaImage) {
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
    layer.add(tr);
    console.log(konvaImage);
    tr.attachTo(konvaImage);
    layer.draw();
  }

  private destroyTransformer() {
    this.stage.find('Transformer').destroy();
    (this.stage.find('Layer')[0] as Konva.Layer).draw();
  }
}

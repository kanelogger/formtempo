export const scrollCameraStage = `
<figure class="scroll-camera">
  <div class="scroll-camera__canvas" data-camera-stage role="img" aria-label="近处是门框，中景是立方体，远处是日轮。镜头横移时，近处的门柱经过并遮住远处的日轮。">
    <div class="scroll-camera__view" aria-hidden="true">
      <div class="scroll-camera__world" data-camera-world>
        <div class="scroll-camera__ground"></div>
        <div class="scroll-camera__sun" data-camera-sun></div>
        <div class="scroll-camera__block">
          <div class="scroll-camera__face scroll-camera__face--front"></div>
          <div class="scroll-camera__face scroll-camera__face--top"></div>
          <div class="scroll-camera__face scroll-camera__face--right"></div>
        </div>
        <div class="scroll-camera__gate">
          <div class="scroll-camera__post scroll-camera__post--left"></div>
          <div class="scroll-camera__post scroll-camera__post--right" data-camera-post></div>
          <div class="scroll-camera__lintel"></div>
        </div>
      </div>
    </div>
  </div>
  <figcaption>门框、立方体和日轮各自固定在原位。进度到 50% 时，近处的门柱挡住远处的日轮。</figcaption>
</figure>`;

// The mesh's anatomical forward has a 26-degree bind yaw. Cancel that and
// turn a further five degrees towards the copy on the viewer's left.
export const WOLFGANG_HOME_YAW=-Math.PI/2-.55;

// Extend only the drawing surface. Wolfgang's stage, scale and hit area stay
// unchanged; the off-centre projection keeps every model pixel in place.
export function shadowViewport({width,height,left,viewportWidth,frameHeight,portrait=false,contained=false}){
 const unitsPerPixel=frameHeight/height,half=width*unitsPerPixel/2;
 const available=portrait||contained?0:Math.max(0,Math.min(left-2,viewportWidth-width));
 const extraLeft=Math.min(available,Math.max(0,Math.ceil((1.05-half)/unitsPerPixel)));
 return {width:width+extraLeft,height,left:-extraLeft||0,cameraLeft:-half-extraLeft*unitsPerPixel,cameraRight:half};
}

// Mobile and contained previews cannot borrow a neighbouring text column.
// Keep the complete cast shadow inside their actual drawing area by lifting
// the light. The margin covers armour around the skeleton and the soft edge.
export function requiredShadowLightHeight(points,leftEdge,{lightX=2,margin=.085,minHeight=3}={}){
 let height=minHeight;
 for(const p of points){
  const room=p.x-margin-leftEdge;
  if(room>.02)height=Math.max(height,lightX*Math.max(0,p.y+margin)/room);
 }
 return height;
}

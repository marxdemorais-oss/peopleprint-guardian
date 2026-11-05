// Shared by the renderer and geometry tests. Keep the artwork within its
// supported view; these rotations do not manufacture a new camera angle.
export function displayPose(p){return {...p,head:(p.head||0)*7,neck:(p.neck||0)*2.2,spine:(p.spine||0)*2,leftUpper:(p.leftUpper||0)*1.4,leftLower:(p.leftLower||0)*8,leftHand:(p.leftHand||0)*2.5,rightUpper:(p.rightUpper||0)*3.5,rightLower:(p.rightLower||0)*3.5,rightHand:(p.rightHand||0)*2.5,shift:(p.shift||0)*2};}
export function advanceMotion(motion,elapsed){let remaining=Math.max(0,Math.min(Number.isFinite(elapsed)?elapsed:0,.25)),pose=motion.snapshot().pose;while(remaining>1e-8){const dt=Math.min(.05,remaining);pose=motion.tick(dt);remaining-=dt;}return pose;}

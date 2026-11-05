export async function staffDirectory(){
 return {entries:[],total:0,directoryTotal:0,sectors:[],nextOffset:null,saved:0,lastChecked:null,passages:[]};
}
export async function scheduledDirectoryReview(){return new Response(null,{status:404,headers:{'Cache-Control':'private, no-store'}});}

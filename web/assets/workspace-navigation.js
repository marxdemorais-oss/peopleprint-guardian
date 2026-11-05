// Sign-in may return to a saved check or the requested paste/upload action.
// The destination route stays fixed; only the existing query is retained.
export function workspaceSignInURL(href){
  let query='',fragment='';
  try{const current=new URL(href);if(current.pathname==='/workspace'){query=current.search;if(/^#continue=[a-f0-9]{64}$/.test(current.hash))fragment=current.hash;}}catch{}
  return '/login?return_to='+encodeURIComponent('/workspace'+query)+fragment;
}

// Only application-owned register destinations can become clickable.
// Names, email addresses and references from a case never appear in a link.
const register='https://find-and-update.company-information.service.gov.uk';
export function organisationReferenceLink(row){
  if(row?.sourceId==='uk-financial-register')return {name:'Open the FCA Financial Services Register',url:'https://register.fca.org.uk/s/'};
  if(row?.sourceId!=='uk-company-register')return null;
  if(row.companyNumber===undefined)return {name:'Search Companies House',url:register+'/'};
  if(typeof row.companyNumber!=='string'||!(/^(?:[0-9]{8}|[A-Z]{2}[0-9]{6})$/).test(row.companyNumber))return null;
  return {name:'Open the Companies House entry',url:register+'/company/'+row.companyNumber};
}

// This is an optional, explicitly shared legal name. Keep common account,
// contact and case identifiers out of the public register's search query.
export function validPublicCompanyName(value){
  if(typeof value!=='string'||value.length>120||/[\r\n\t]/.test(value))return false;
  const name=value.trim();
  return /^[\p{L}\p{N}][\p{L}\p{N} &'’(),-]{0,100} (?:limited|ltd|plc|llp)\.?$/iu.test(name)
    && !/\d{4}|\d[ ()-]*\d[ ()-]*\d[ ()-]*\d|\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b|\b(?:OTP|password|passcode|postcode|email|IBAN|invoice reference|reference number|account number|login code|my name|my address)\b/i.test(name);
}

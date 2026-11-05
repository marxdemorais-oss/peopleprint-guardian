// Local QA only. This module is never included in the deployed Worker.
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
export function localDatabase(){
  mkdirSync(new URL('../.local/',import.meta.url),{recursive:true});
  const db=new DatabaseSync(new URL('../.local/guardian-preview.sqlite',import.meta.url).pathname);
  db.exec('CREATE TABLE IF NOT EXISTS _local_migrations (tag TEXT PRIMARY KEY, hash TEXT)');
  const journal=JSON.parse(readFileSync(new URL('../drizzle/meta/_journal.json',import.meta.url),'utf8'));
  for(const item of journal.entries){const sql=readFileSync(new URL('../drizzle/'+item.tag+'.sql',import.meta.url),'utf8'),hash=createHash('sha256').update(sql).digest('hex');const applied=db.prepare('SELECT hash FROM _local_migrations WHERE tag=?').get(item.tag);if(applied&&applied.hash!==hash)throw new Error('Local schema changed after applying. Use a fresh QA database.');if(!applied){db.exec(sql);db.prepare('INSERT INTO _local_migrations(tag,hash) VALUES (?,?)').run(item.tag,hash);}}
  function prepared(sql,values=[]){const statement=db.prepare(sql);return {bind(...v){return prepared(sql,v);},async first(){return statement.get(...values)||null;},async all(){return {results:statement.all(...values)};},async run(){const info=statement.run(...values);return {meta:{changes:Number(info.changes)}};},_execute(){if(statement.columns().length)return {results:statement.all(...values)};const info=statement.run(...values);return {results:[],meta:{changes:Number(info.changes)}};}};}
  return {prepare:prepared,async batch(list){db.exec('BEGIN');try{const result=list.map(q=>q._execute());db.exec('COMMIT');return result;}catch(e){db.exec('ROLLBACK');throw e;}}};
}

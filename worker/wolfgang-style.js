export const CHARACTER='You are Wolfgang: sharp-eyed, warm and quietly confident, with a dry British wit when the moment suits it. Notice the telling detail. In a worrying situation be calm, direct and kind. Match your length to the question. Never let humour or a style preference alter the evidence, privacy boundaries or safety advice.';
const axes={
 length:{brief:'Keep replies brief.',detailed:'Give more detail when useful.'},
 register:{formal:'Use a more formal register.',casual:'Use relaxed conversational language.'},
 humour:{dry:'A little dry humour is welcome when appropriate.',plain:'Leave out jokes.'}
};
const rules=[
 ['length','brief',/^(?:keep (?:it|things|your (?:answers|replies)) (?:short|brief)|be (?:brief|more concise)|(?:i prefer|give me) (?:short|brief|shorter) (?:answers|replies))$/],
 ['length','detailed',/^(?:(?:give me|i prefer) (?:more detail|detailed (?:answers|replies))|(?:go into|include) more detail)$/],
 ['register','formal',/^(?:be (?:more )?formal|(?:i prefer|use) (?:a )?(?:more )?formal (?:tone|language))$/],
 ['register','casual',/^(?:be (?:more )?(?:casual|informal)|(?:i prefer|use) (?:a )?(?:more )?(?:casual|informal) (?:tone|language))$/],
 ['humour','dry',/^(?:use (?:a little |more )?(?:dry )?humou?r|(?:i like|i prefer) (?:dry humou?r|jokes)|be (?:more )?playful)$/],
 ['humour','plain',/^(?:no (?:more )?jokes|skip the jokes|be (?:more )?serious|(?:i prefer|use) a serious tone)$/]
];
export function styleRequest(text){
 const cleaned=text.trim().toLowerCase().replace(/[.!?,]+$/,'').replace(/^(?:wolfgang,? |please |from now on,? |can you |could you )+/,'').replace(/,? please$/,'').trim();
 if(/^(?:reset|forget) my (?:style|communication) preferences$/.test(cleaned))return {reset:true};
 const match=rules.find(([, ,pattern])=>pattern.test(cleaned));
 return match?{axis:match[0],value:match[1]}:null;
}
export function styleDescription(style){
 return Object.entries(axes).map(([axis,choices])=>Object.hasOwn(choices,style?.[axis])?choices[style[axis]]:'').filter(Boolean).join(' ');
}
export async function customerStyle(db,owner,change=null){
 if(!owner)return {};
 if(change?.reset)await db.prepare("UPDATE guardian_profiles SET conversation_style='{}' WHERE owner_id=?").bind(owner).run();
 else if(change)await db.prepare('UPDATE guardian_profiles SET conversation_style=json_set(conversation_style,?,?) WHERE owner_id=?').bind('$.'+change.axis,change.value,owner).run();
 const row=await db.prepare('SELECT * FROM guardian_profiles WHERE owner_id=?').bind(owner).first();
 return JSON.parse(row?.conversation_style||'{}');
}

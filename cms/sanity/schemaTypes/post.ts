import {defineType, defineField, defineArrayMember} from 'sanity'

export const post = defineType({
  name: 'post', title: 'Blog articles', type: 'document',
  description: 'Draft first. A human must verify sources, attribution, image permission and factual claims before publishing. Website release is separately approved.',
  fields: [
    defineField({name:'title',type:'string',validation:r=>r.required().max(100)}),
    defineField({name:'slug',type:'slug',options:{source:'title',maxLength:80},validation:r=>r.required().custom((v:any)=>!v?.current || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.current) || 'Use lowercase words separated by hyphens')}),
    defineField({name:'description',title:'SEO description / summary',type:'text',rows:3,validation:r=>r.required().min(30).max(160)}),
    defineField({name:'authorName',title:'Actual author name',description:'Do not attribute AI-written copy to Joao without his approval.',type:'string',validation:r=>r.required()}),
    defineField({name:'publishedAt',type:'datetime',validation:r=>r.required()}),
    defineField({name:'updatedAt',title:'Editorial review date',type:'datetime'}),
    defineField({name:'heroImage',type:'image',options:{hotspot:true},fields:[defineField({name:'alt',type:'string',validation:r=>r.required()}),defineField({name:'credit',type:'string'}),defineField({name:'permissionSource',title:'Ownership / permission evidence (not personal information)',type:'string',validation:r=>r.required()})]}),
    defineField({name:'sources',type:'array',of:[defineArrayMember({type:'object',fields:[defineField({name:'label',type:'string',validation:r=>r.required()}),defineField({name:'url',type:'url',validation:r=>r.required().uri({scheme:['https']})})]})]}),
    defineField({name:'body',type:'array',validation:r=>r.required().min(1),of:[
      defineArrayMember({type:'block',styles:[{title:'Paragraph',value:'normal'},{title:'Heading 2',value:'h2'},{title:'Heading 3',value:'h3'},{title:'Quote (verified only)',value:'blockquote'}],lists:[{title:'Bullets',value:'bullet'},{title:'Numbered',value:'number'}],marks:{decorators:[{title:'Strong',value:'strong'},{title:'Emphasis',value:'em'}],annotations:[{name:'link',type:'object',fields:[defineField({name:'href',type:'string',validation:r=>r.required().custom((v:string|undefined)=>!v || /^(?:tel:\+[1-9][0-9]{7,14}|\/(?!\/)[^\s\\]*|https:\/\/[^\s\\]+)$/.test(v) || 'Use HTTPS, a root-relative path or an international tel number')})]}]}}),
      defineArrayMember({type:'image',options:{hotspot:true},fields:[defineField({name:'alt',type:'string',validation:r=>r.required()}),defineField({name:'permissionSource',type:'string',validation:r=>r.required()})]})
    ]}),
    defineField({name:'humanApproved',title:'Human approved for website publication',type:'boolean',initialValue:false,description:'Confirm facts, sources, author and media consent. A release is still required to change Bluehost.',validation:r=>r.custom(v=>v===true || 'A human must approve this article before Publish')}),
  ],
  preview:{select:{title:'title',subtitle:'authorName',media:'heroImage'}},
})

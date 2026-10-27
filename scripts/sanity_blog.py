"""Static, published-only Sanity blog. No credentials, drafts or browser API calls."""
import json
import re
from datetime import datetime, timezone
from html import escape
from urllib.parse import urlencode, urlsplit
from urllib.request import urlopen
from main_navbar import render_navbar, navbar_assets

PROJECT='9ma5tkiq'
DATASET='production'
QUERY='*[_type == "post" && !(_id in path("drafts.**")) && humanApproved == true && defined(publishedAt) && dateTime(publishedAt) <= dateTime(now())] | order(publishedAt desc){_id,humanApproved,title,slug,description,authorName,publishedAt,updatedAt,body,sources,heroImage}'

def safe_link(value):
    if not isinstance(value,str) or re.search(r'[\s\\\x00-\x1f\x7f]',value):return None
    if value.startswith('tel:'):
        return value if re.fullmatch(r'tel:\+[1-9][0-9]{7,14}',value) else None
    u=urlsplit(value)
    if value.startswith('/') and not value.startswith('//'):return value
    return value if u.scheme=='https' and u.hostname and not u.username and not u.password else None

def image_html(image):
    ref=image.get('asset',{}).get('_ref','')
    match=re.fullmatch(r'image-([a-f0-9]+)-(\d+)x(\d+)-(jpg|jpeg|png|webp)',ref)
    if not match or not image.get('alt') or not image.get('permissionSource'):
        raise ValueError('Image needs a valid asset, alt and permission source')
    digest,width,height,ext=match.groups()
    url=f'https://cdn.sanity.io/images/{PROJECT}/{DATASET}/{digest}-{width}x{height}.{ext}?w=1160&fit=max&auto=format'
    return f'<img src="{escape(url,quote=True)}" alt="{escape(image["alt"],quote=True)}" width="{width}" height="{height}" loading="lazy">'

def portable_text(blocks):
    output=[]; list_tag=None
    for block in blocks:
        kind=block.get('_type')
        if kind=='image':
            if list_tag:output.append('</'+list_tag+'>'); list_tag=None
            output.append(image_html(block));continue
        if kind!='block':raise ValueError('Unsupported Portable Text block')
        desired={'bullet':'ul','number':'ol'}.get(block.get('listItem'))
        # Nested levels are intentionally rejected rather than silently misrendered.
        if block.get('level',1)!=1:raise ValueError('Only single-level lists supported')
        if desired!=list_tag:
            if list_tag:output.append('</'+list_tag+'>')
            if desired:output.append('<'+desired+'>')
            list_tag=desired
        definitions={d['_key']:d for d in block.get('markDefs',[])}
        children=[]
        for span in block.get('children',[]):
            if span.get('_type')!='span':raise ValueError('Unsupported inline block')
            text=escape(span.get('text','')).replace('\n','<br>')
            for mark in span.get('marks',[]):
                if mark in ('strong','em'):text=f'<{mark}>{text}</{mark}>'
                elif mark in definitions:
                    href=safe_link(definitions[mark].get('href'))
                    if href:text=f'<a href="{escape(href,quote=True)}">{text}</a>'
                else:raise ValueError('Unsupported annotation')
            children.append(text)
        tag='li' if desired else {'normal':'p','h2':'h2','h3':'h3','blockquote':'blockquote'}.get(block.get('style','normal'))
        if not tag:raise ValueError('Unsupported heading style')
        output.append(f'<{tag}>'+''.join(children)+f'</{tag}>')
    if list_tag:output.append('</'+list_tag+'>')
    return '\n'.join(output)

def date(value):
    parsed=datetime.fromisoformat(value.replace('Z','+00:00'))
    if parsed.tzinfo is None:raise ValueError('Date needs timezone')
    return parsed

def validate_posts(posts):
    seen=set()
    for post in posts:
        slug=post.get('slug',{}).get('current','')
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',slug) or len(slug)>80 or slug in seen or slug in ('index','assets','feed','sitemap','robots'):
            raise ValueError('Unsafe, reserved or duplicate blog slug')
        seen.add(slug)
        if post.get('humanApproved') is not True:raise ValueError('Human approval required')
        if post.get('_id','').startswith(('drafts.','versions.')):raise ValueError('Draft/release rejected')
        for key in ('title','description','authorName'):
            if not isinstance(post.get(key),str) or not post[key].strip():raise ValueError('Missing '+key)
        if date(post['publishedAt'])>datetime.now(timezone.utc):raise ValueError('Future publication rejected')
        if post.get('updatedAt'):date(post['updatedAt'])
        portable_text(post.get('body',[]))
        if not post.get('body'):raise ValueError('Body required')
    return posts

def fetch_posts():
    query=urlencode({'query':QUERY,'perspective':'published'})
    with urlopen(f'https://{PROJECT}.api.sanity.io/v2026-07-10/data/query/{DATASET}?{query}',timeout=30) as response:
        posts=json.load(response)['result']
    if not isinstance(posts,list):raise ValueError('Invalid CMS response')
    return validate_posts(posts)

def page(title, description, route, content, schema=None, production=False):
    robots='index,follow' if production else 'noindex,nofollow'
    label='FROM THE ACADEMY' if production else 'BLOG PREVIEW · NOT LIVE ON BLUEHOST'
    metadata='' if schema is None else '<script type="application/ld+json">'+json.dumps(schema).replace('<','\\u003c')+'</script>'
    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="/">
<title>{escape(title)} | Joao Crus BJJ</title><meta name="description" content="{escape(description,quote=True)}"><meta name="robots" content="{robots}"><link rel="canonical" href="https://joaocrusbjj.com{route}">
<link rel="icon" href="/assets/joao-crus-bjj-logo.png"><meta property="og:title" content="{escape(title,quote=True)}"><meta property="og:description" content="{escape(description,quote=True)}"><meta property="og:url" content="https://joaocrusbjj.com{route}"><meta property="og:type" content="{'article' if schema else 'website'}">
<link rel="stylesheet" href="/assets/campaign-site.css"><link rel="stylesheet" href="/assets/blog.css">{navbar_assets()}{metadata}</head><body>
<a class="blog-skip" href="{route}#main">Skip to content</a>{render_navbar(route)}
<main id="main" class="blog-main"><p class="blog-label">{label}</p>{content}</main>
<footer class="blog-footer"><a href="/parent-guide/">Parent Guide</a><a href="/resources/">Resources</a><a href="/contact/">Contact the academy</a><a href="/privacy/">Privacy</a></footer></body></html>'''

def build_blog(dist, posts, production=False):
    validate_posts(posts)
    listing=[]
    for post in posts:
        slug=post['slug']['current']; route=f'/blog/{slug}/'
        body=portable_text(post['body'])
        if post.get('heroImage'):
            image=post['heroImage']
            credit=f'<figcaption>{escape(image["credit"])}</figcaption>' if image.get('credit') else ''
            body='<figure>'+image_html(image)+credit+'</figure>'+body
        sources=[]
        for source in post.get('sources',[]):
            href=safe_link(source.get('url'))
            if not href:raise ValueError('Unsafe source URL')
            sources.append(f'<li><a href="{escape(href,quote=True)}">{escape(source["label"])}</a></li>')
        if sources:body+='<h2>Sources</h2><ul>'+''.join(sources)+'</ul>'
        content=f'<a href="/blog/">All articles</a><article><h1>{escape(post["title"])}</h1><p>{escape(post["description"])}</p><p>By {escape(post["authorName"])} · <time datetime="{escape(post["publishedAt"],quote=True)}">{date(post["publishedAt"]).strftime("%B %d, %Y")}</time></p><div class="blog-body">{body}</div></article><p><a class="blog-button" href="/contact/">Ask about classes</a></p>'
        schema={'@context':'https://schema.org','@type':'Article','headline':post['title'],'description':post['description'],'author':{'@type':'Person','name':post['authorName']},'datePublished':post['publishedAt'],'mainEntityOfPage':'https://joaocrusbjj.com'+route}
        if post.get('heroImage'):
            ref=post['heroImage']['asset']['_ref']
            digest,dimensions,ext=ref.removeprefix('image-').rsplit('-',2)
            schema['image']=f'https://cdn.sanity.io/images/{PROJECT}/{DATASET}/{digest}-{dimensions}.{ext}'
        schema['publisher']={'@type':'Organization','name':'Joao Crus Brazilian Jiu-Jitsu','url':'https://joaocrusbjj.com/'}
        if post.get('updatedAt'):schema['dateModified']=post['updatedAt']
        target=dist/'blog'/slug/'index.html';target.parent.mkdir(parents=True,exist_ok=True)
        breadcrumbs={'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Home','item':'https://joaocrusbjj.com/'},{'@type':'ListItem','position':2,'name':'Blog','item':'https://joaocrusbjj.com/blog/'},{'@type':'ListItem','position':3,'name':post['title'],'item':'https://joaocrusbjj.com'+route}]}
        target.write_text(page(post['title'],post['description'],route,content,[schema,breadcrumbs],production))
        listing.append(f'<article class="blog-card"><h2><a href="{route}">{escape(post["title"])}</a></h2><p>{escape(post["description"])}</p></article>')
    content='<h1>From the academy</h1><p>Articles and practical answers from Joao Crus BJJ.</p>'
    content+=''.join(listing) if listing else '<section class="blog-card"><h2>New articles are on the way</h2><p>In the meantime, explore our existing Parent Guide for answers about starting jiu-jitsu.</p><a class="blog-button" href="/parent-guide/">Read the Parent Guide</a></section>'
    target=dist/'blog'/'index.html'; target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text(page('From the academy','Articles and practical answers from Joao Crus Brazilian Jiu-Jitsu.','/blog/',content,production=production))
    (dist/'blog'/'build-manifest.json').write_text(json.dumps({'projectId':PROJECT,'dataset':DATASET,'perspective':'published','posts':[p['_id'] for p in posts],'releaseStatus':'production' if production else 'preview-only'},indent=2))
    print(f'Built blog preview with {len(posts)} approved published articles; drafts excluded')

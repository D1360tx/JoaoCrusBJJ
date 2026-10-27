#!/usr/bin/env python3
"""Owner-controlled Sanity draft operations. Never publish or export credentials.
This is NOT an isolation boundary from other processes running as this OS user.
Do not give bots the backing Editor token; remotely hosted agents need a separately
reviewed authenticated gateway. Native Editor tokens can publish outside this CLI.
"""
import argparse
import json
import re
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urlencode

PROJECT = '9ma5tkiq'
DATASET = 'production'
SECRET = Path.home() / '.joao-secure/sanity-blog-token.json'
BASE = f'https://{PROJECT}.api.sanity.io/v2026-07-10'

def request(path, data=None, content_type='application/json'):
    if SECRET.stat().st_mode & 0o077:
        raise ValueError('Credential permissions must be 0600')
    token = json.loads(SECRET.read_text())['token']
    req = Request(BASE + path, data=data, headers={'Authorization':'Bearer '+token,'Content-Type':content_type})
    with urlopen(req, timeout=30) as response:
        return json.load(response)

def draft_document(key, document):
    if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', key) or len(key)>80:
        raise ValueError('Invalid idempotency key')
    allowed={'title','slug','description','authorName','body','sources','heroImage'}
    if set(document)-allowed:
        raise ValueError('Unsupported fields; approval and publication are human-only')
    if not isinstance(document.get('title'),str) or not document['title'].strip():
        raise ValueError('Title required')
    return {**document,'_id':'drafts.agent-'+key,'_type':'post','humanApproved':False}

def save_draft(key, document):
    doc=draft_document(key,document)
    request('/data/mutate/'+DATASET, json.dumps({'mutations':[{'createOrReplace':doc}]}).encode())
    rows=request('/data/query/'+DATASET+'?'+urlencode({'query':'*[_id == $id]','$id':json.dumps(doc['_id']),'perspective':'raw'}))['result']
    if len(rows)!=1 or rows[0]['title']!=doc['title'] or rows[0].get('humanApproved') is not False:
        raise RuntimeError('Draft readback failed')
    return {'id':rows[0]['_id'],'revision':rows[0]['_rev'],'humanApproved':False}

def upload(path):
    path=Path(path)
    types={'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp'}
    mime=types.get(path.suffix.lower())
    if not mime or path.stat().st_size>10*1024*1024:
        raise ValueError('Only PNG/JPEG/WebP images up to 10 MB')
    doc=request('/assets/images/'+DATASET+'?'+urlencode({'filename':path.name}),path.read_bytes(),mime)['document']
    result=request('/data/query/'+DATASET+'?'+urlencode({'query':'*[_id == $id][0]{_id,size,sha1hash}','$id':json.dumps(doc['_id'])}))['result']
    if not result or result['size']!=path.stat().st_size:raise RuntimeError('Asset readback failed')
    return result

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    commands=parser.add_subparsers(dest='command',required=True)
    draft=commands.add_parser('draft'); draft.add_argument('key'); draft.add_argument('json_file',type=Path)
    image=commands.add_parser('upload'); image.add_argument('image_file',type=Path)
    args=parser.parse_args()
    result=save_draft(args.key,json.loads(args.json_file.read_text())) if args.command=='draft' else upload(args.image_file)
    print(json.dumps(result,indent=2))

if __name__=='__main__':main()

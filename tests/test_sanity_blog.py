import copy
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import sanity_blog as blog
import sanity_drafts as drafts

def block(text='An illustrative local test, not public content.',**kwargs):
    return {'_type':'block','style':'normal','children':[{'_type':'span','text':text,'marks':[]}],'markDefs':[],**kwargs}

def post():
    return {'_id':'fixture','humanApproved':True,'title':'Local fixture, not an academy article','slug':{'current':'local-test-fixture'},'description':'A local renderer fixture. Never seeded or published to Sanity.','authorName':'Test fixture','publishedAt':'2026-01-01T00:00:00Z','body':[block()]}

class BlogTests(unittest.TestCase):
    def test_safe_links(self):
        for value in ['javascript:alert(1)','//evil.example','/\\evil','https://x.example/\n','data:text/html,hi','https://user:pass@evil.example']:
            self.assertIsNone(blog.safe_link(value))
        for value in ['/contact/','https://www.sanity.io/docs']:
            self.assertEqual(blog.safe_link(value),value)
    def test_html_escape(self):
        self.assertNotIn('<script>',blog.portable_text([block('<script>alert(1)</script>')]))
    def test_phone_links(self):
        self.assertEqual(blog.safe_link('tel:+15126444560'),'tel:+15126444560')
        for value in ['tel:javascript:alert(1)','tel:+15126444560;ext=1','tel:+１５１２６４４４５６０','tel:+1512%0a123456','tel:1234','tel:+15126444560?x=1']:
            self.assertIsNone(blog.safe_link(value))
    def test_production_indexability(self):
        hosting=(Path(__file__).resolve().parents[1]/'deploy/bluehost/.htaccess').read_text()
        self.assertNotIn('RewriteRule ^blog/?$',hosting)
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory);blog.build_blog(root,[post()],production=True)
            text=(root/'blog/local-test-fixture/index.html').read_text()
            self.assertIn('content="index,follow"',text)
            self.assertNotIn('NOT LIVE',text)
            self.assertIn('BreadcrumbList',text)
    def test_marks_lists(self):
        b=block('text',listItem='bullet');b['children'][0]['marks']=['strong','em']
        html=blog.portable_text([b,block('Next',style='h2')])
        self.assertIn('<ul><li><em><strong>text</strong></em></li>',html.replace('\n',''))
        self.assertIn('</ul>\n<h2>Next</h2>',html)
    def test_nested_list_rejected(self):
        with self.assertRaises(ValueError):blog.portable_text([block(level=2,listItem='number')])
    def test_unsafe_mark_not_linked(self):
        b=block();b['markDefs']=[{'_key':'x','href':'javascript:alert(1)'}];b['children'][0]['marks']=['x']
        self.assertNotIn('<a',blog.portable_text([b]))
    def test_slug_rejection(self):
        for slug in ['../about','UPPER','a/b','index','robots','-bad','']:
            p=post();p['slug']['current']=slug
            with self.assertRaises(ValueError):blog.validate_posts([p])
    def test_duplicate_rejection(self):
        with self.assertRaises(ValueError):blog.validate_posts([post(),post()])
    def test_draft_and_future_and_approval(self):
        for key,value in [('_id','drafts.fixture'),('_id','versions.release.fixture'),('publishedAt','2099-01-01T00:00:00Z'),('humanApproved',False),('humanApproved',None)]:
            p=post();p[key]=value
            with self.assertRaises(ValueError):blog.validate_posts([p])
    def test_dates(self):
        for bad in ['tomorrow','2026-01-01']:
            p=post();p['publishedAt']=bad
            with self.assertRaises(ValueError):blog.validate_posts([p])
    def test_image(self):
        image={'asset':{'_ref':'image-ab12-512x512-png'},'alt':'Logo "academy"','permissionSource':'Owned logo'}
        self.assertIn('width="512"',blog.image_html(image)); self.assertIn('&quot;',blog.image_html(image))
        image['permissionSource']=''
        with self.assertRaises(ValueError):blog.image_html(image)
    def test_unknown_block_rejected(self):
        with self.assertRaises(ValueError):blog.portable_text([{'_type':'html','html':'<script>'}])
    def test_query_published_only(self):
        self.assertIn('humanApproved == true',blog.QUERY);self.assertIn('drafts.**',blog.QUERY);self.assertIn('dateTime(now())',blog.QUERY)
    def test_empty_blog(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory);blog.build_blog(root,[])
            text=(root/'blog/index.html').read_text();self.assertIn('noindex,nofollow',text);self.assertIn('New articles are on the way',text)
            self.assertEqual(json.loads((root/'blog/build-manifest.json').read_text())['posts'],[])
    def test_article_render_and_schema(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory);p=post();p['title']='Title <script>'
            blog.build_blog(root,[p]);text=(root/'blog/local-test-fixture/index.html').read_text()
            self.assertNotIn('Title <script>',text);self.assertIn('\\u003cscript>',text);self.assertIn('datePublished',text);self.assertNotIn('dateModified',text)
            self.assertIn('href="/contact/"',text);self.assertIn('noindex,nofollow',text)
    def test_draft_interface(self):
        doc=drafts.draft_document('example',{'title':'Draft'})
        self.assertEqual(doc['_id'],'drafts.agent-example');self.assertFalse(doc['humanApproved'])
        for key in ['humanApproved','publishedAt','_id','_type']:
            with self.assertRaises(ValueError):drafts.draft_document('example',{'title':'Draft',key:True})
    def test_invalid_draft_key(self):
        for key in ['../x','drafts.x','UPPER','']:
            with self.assertRaises(ValueError):drafts.draft_document(key,{'title':'Draft'})
    def test_no_publish_interface(self):
        self.assertNotIn('publish',list(drafts.__dict__.keys()))

if __name__=='__main__':unittest.main()

import copy
import unittest
import control_plane as cp
import test_control_plane as fixtures

class CRMCoverageReportingTests(unittest.TestCase):
    def setUp(self):
        f=fixtures.ControlPlaneTests();f.setUp()
        self.snapshot=copy.deepcopy(f.snapshot);self.policy=f.policy
    def test_coverage_failure_is_not_connector_auth(self):
        self.snapshot['ghl'].update(source_status='blocked',reason='Historical query truncated after 500 contacts')
        final=cp.finalize(self.snapshot,self.policy)
        self.assertIn('Repair the CRM collector',final['recommendation'])
        self.assertNotIn('Restore',final['recommendation'])
        self.assertIn('500 contacts',final['rule_evaluations'][0]['evidence'])
    def test_retained_complete_history_unresolved_recommendation(self):
        self.snapshot['ghl'].update(coverage={'collection_verified':True,'history_reconciled':False},coverage_reason='Retained history scanned; Sep29 comparison unresolved')
        final=cp.finalize(self.snapshot,self.policy)
        self.assertIn('Reconcile the historical CRM snapshot',final['recommendation'])
        self.assertEqual(final['status'],'blocked')
    def test_unreconciled_numeric_observations_cannot_enable_economics(self):
        self.snapshot['meta']['launch_to_date']['spend']=1000
        self.snapshot['ghl'].update(coverage={'collection_verified':True,'history_reconciled':False})
        self.snapshot['ghl']['launch_to_date']={'accepted_website_submissions':100,'accepted_website_leads':90,'scheduled_visits':20}
        result=cp.compute_economics(self.snapshot,self.policy)
        self.assertIsNone(result['proxy_cost_per_accepted_submission_usd'])
        self.assertIsNone(result['proxy_cost_per_accepted_lead_usd'])
        self.assertIsNone(result['cost_per_scheduled_visit_usd'])
        self.assertFalse(result['target_learning_ready'])
    def test_auth_failure_still_connector_repair(self):
        self.snapshot['ghl'].update(source_status='blocked',reason='HighLevel returned HTTP 401')
        self.assertIn('Restore the read-only ghl connector',cp.finalize(self.snapshot,self.policy)['recommendation'])
    def test_missing_v2_coverage_cannot_bypass_gate(self):
        self.snapshot['ghl']['methodology_version']=2
        self.assertFalse(cp.cumulative_crm_verified(self.snapshot))
    def test_complete_reconciliation_can_pass_without_changing_legacy_counts(self):
        self.snapshot['ghl']['coverage']={'collection_verified':True,'history_reconciled':True}
        self.assertTrue(cp.cumulative_crm_verified(self.snapshot))

if __name__=='__main__':unittest.main()

"""Synthetic unit inputs only: no historical/provider evidence is fabricated."""
import copy
import unittest
import control_plane as cp
import test_control_plane as fixtures

class HistoricalRevisionSafety(unittest.TestCase):
    def setUp(self):
        f=fixtures.ControlPlaneTests();f.setUp()
        self.snapshot=copy.deepcopy(f.snapshot);self.policy=f.policy
        self.snapshot['ghl'].update(methodology_version=2, coverage={'collection_verified':True,'history_reconciled':False})
    def test_qa_pruning_not_permission_to_clear_history(self):
        for count in (42,47,71,100):
            self.snapshot['ghl']['launch_to_date']={'accepted_website_submissions':count,'accepted_website_leads':37,'scheduled_visits':16}
            self.assertFalse(cp.cumulative_crm_verified(self.snapshot))
            self.assertIsNone(cp.compute_economics(self.snapshot,self.policy)['proxy_cost_per_accepted_submission_usd'])
    def test_new_revision_leaves_immutable_input_untouched(self):
        old=copy.deepcopy(self.snapshot)
        cp.finalize(self.snapshot,self.policy)
        self.assertEqual(old,self.snapshot)
    def test_daily_verified_does_not_override_launch_unknown(self):
        self.snapshot['ghl']['yesterday']['coverage']={'collection_verified':True,'history_reconciled':True}
        self.assertFalse(cp.cumulative_crm_verified(self.snapshot))
    def test_launch_scope_overrides_unrelated_verified_scope(self):
        self.snapshot['ghl']['coverage']['history_reconciled']=True
        self.snapshot['ghl']['launch_to_date']={'coverage':{'collection_verified':True,'history_reconciled':False}}
        self.assertFalse(cp.cumulative_crm_verified(self.snapshot))

if __name__=='__main__':unittest.main()

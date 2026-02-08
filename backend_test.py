import requests
import sys
import json
from datetime import datetime

class NoorVisionAPITester:
    def __init__(self, base_url="https://ruya-ai.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.dream_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=60)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and len(str(response_data)) < 500:
                        print(f"   Response: {json.dumps(response_data, indent=2)}")
                    else:
                        print(f"   Response received (large data)")
                except:
                    print(f"   Response: {response.text[:200]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:300]}...")

            return success, response.json() if response.text and response.status_code < 500 else {}

        except requests.Timeout:
            print(f"❌ Failed - Request timeout (30s)")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test API health endpoints"""
        print("\n" + "="*50)
        print("TESTING HEALTH ENDPOINTS")
        print("="*50)
        
        # Test root endpoint
        success1, _ = self.run_test("Root Endpoint", "GET", "/api/", 200)
        
        # Test health check
        success2, _ = self.run_test("Health Check", "GET", "/api/health", 200)
        
        return success1 and success2

    def test_user_registration(self):
        """Test user registration"""
        print("\n" + "="*50)
        print("TESTING USER REGISTRATION")
        print("="*50)
        
        timestamp = datetime.now().strftime('%H%M%S')
        test_user_data = {
            "name": f"Test User {timestamp}",
            "email": f"testuser{timestamp}@gmail.com",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "/api/auth/register",
            200,
            data=test_user_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            if 'user' in response and 'id' in response['user']:
                self.user_id = response['user']['id']
                print(f"   ✅ Token received and user ID: {self.user_id}")
            return True
        return False

    def test_user_login(self):
        """Test user login with the registered user"""
        print("\n" + "="*50)
        print("TESTING USER LOGIN")
        print("="*50)
        
        if not self.token:
            print("❌ Skipping login test - no user registered")
            return False
            
        # Create new user for login test
        timestamp = datetime.now().strftime('%H%M%S') + "2"
        register_data = {
            "name": f"Login Test User {timestamp}",
            "email": f"logintest{timestamp}@gmail.com",
            "password": "LoginTest123!"
        }
        
        # Register user for login
        reg_success, reg_response = self.run_test(
            "Register User for Login",
            "POST",
            "/api/auth/register",
            200,
            data=register_data
        )
        
        if not reg_success:
            return False
            
        # Test login
        login_data = {
            "email": register_data["email"],
            "password": register_data["password"]
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "/api/auth/login",
            200,
            data=login_data
        )
        
        return success and 'access_token' in response

    def test_auth_me(self):
        """Test get current user endpoint"""
        print("\n" + "="*50)
        print("TESTING AUTH ME ENDPOINT")
        print("="*50)
        
        if not self.token:
            print("❌ Skipping auth/me test - no token available")
            return False
            
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "/api/auth/me",
            200
        )
        
        return success and 'id' in response

    def test_dream_interpretation(self):
        """Test dream interpretation with AI"""
        print("\n" + "="*50)
        print("TESTING DREAM INTERPRETATION (AI)")
        print("="*50)
        
        if not self.token:
            print("❌ Skipping dream interpretation - no token available")
            return False
            
        dream_data = {
            "content": "I saw myself in a beautiful garden with flowing water and ripe fruits hanging from trees. There was a bright light above me and I felt very peaceful and happy. I was wearing white clothes and there were other people in white around me.",
            "track_patterns": True
        }
        
        print("⏳ This test may take 30-60 seconds due to AI processing...")
        success, response = self.run_test(
            "Dream Interpretation",
            "POST", 
            "/api/dreams/interpret",
            200,
            data=dream_data
        )
        
        if success and 'id' in response:
            self.dream_id = response['id']
            # Verify interpretation fields
            required_fields = ['category', 'interpretation', 'symbols', 'guidance']
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                print(f"⚠️  Missing interpretation fields: {missing_fields}")
            else:
                print(f"✅ All interpretation fields present")
            return True
            
        return False

    def test_dream_history(self):
        """Test dream history retrieval"""
        print("\n" + "="*50)
        print("TESTING DREAM HISTORY")
        print("="*50)
        
        if not self.token:
            print("❌ Skipping dream history - no token available")
            return False
            
        success, response = self.run_test(
            "Get Dream History",
            "GET",
            "/api/dreams/history?limit=5",
            200
        )
        
        if success:
            if isinstance(response, list):
                print(f"✅ History returned {len(response)} dreams")
                return True
            else:
                print(f"⚠️  Expected list, got {type(response)}")
                
        return False

    def test_dream_detail(self):
        """Test getting specific dream detail"""
        print("\n" + "="*50)
        print("TESTING DREAM DETAIL")
        print("="*50)
        
        if not self.token or not self.dream_id:
            print("❌ Skipping dream detail - no token or dream ID available")
            return False
            
        success, response = self.run_test(
            "Get Dream Detail",
            "GET",
            f"/api/dreams/{self.dream_id}",
            200
        )
        
        return success and 'id' in response and response['id'] == self.dream_id

    def test_pattern_analysis(self):
        """Test pattern analysis"""
        print("\n" + "="*50)
        print("TESTING PATTERN ANALYSIS")
        print("="*50)
        
        if not self.token:
            print("❌ Skipping pattern analysis - no token available")
            return False
            
        success, response = self.run_test(
            "Pattern Analysis",
            "GET",
            "/api/dreams/patterns/analysis",
            200
        )
        
        if success:
            required_fields = ['total_dreams', 'recurring_symbols', 'category_breakdown', 'insights']
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                print(f"⚠️  Missing pattern analysis fields: {missing_fields}")
            else:
                print(f"✅ All pattern analysis fields present")
            return True
            
        return False

    def test_unauthorized_access(self):
        """Test that protected endpoints require authentication"""
        print("\n" + "="*50)
        print("TESTING UNAUTHORIZED ACCESS")
        print("="*50)
        
        # Temporarily remove token
        original_token = self.token
        self.token = None
        
        success1, _ = self.run_test(
            "Unauthorized Dreams History",
            "GET",
            "/api/dreams/history",
            403  # Changed from 401 to 403
        )
        
        success2, _ = self.run_test(
            "Unauthorized Pattern Analysis",
            "GET", 
            "/api/dreams/patterns/analysis",
            403  # Changed from 401 to 403
        )
        
        # Restore token
        self.token = original_token
        
        return success1 and success2

def main():
    print("🌙 NoorVision API Testing Suite")
    print("=" * 60)
    
    tester = NoorVisionAPITester()
    
    test_results = []
    
    # Run all tests
    test_results.append(("Health Check", tester.test_health_check()))
    test_results.append(("User Registration", tester.test_user_registration()))
    test_results.append(("User Login", tester.test_user_login()))
    test_results.append(("Auth Me", tester.test_auth_me()))
    test_results.append(("Dream Interpretation", tester.test_dream_interpretation()))
    test_results.append(("Dream History", tester.test_dream_history()))
    test_results.append(("Dream Detail", tester.test_dream_detail()))
    test_results.append(("Pattern Analysis", tester.test_pattern_analysis()))
    test_results.append(("Unauthorized Access", tester.test_unauthorized_access()))
    
    # Print final results
    print("\n" + "="*60)
    print("📊 FINAL TEST RESULTS")
    print("="*60)
    
    passed_tests = []
    failed_tests = []
    
    for test_name, result in test_results:
        if result:
            print(f"✅ {test_name}")
            passed_tests.append(test_name)
        else:
            print(f"❌ {test_name}")
            failed_tests.append(test_name)
    
    print(f"\n📈 Tests passed: {len(passed_tests)}/{len(test_results)}")
    success_rate = (len(passed_tests) / len(test_results)) * 100
    print(f"📈 Success rate: {success_rate:.1f}%")
    
    if failed_tests:
        print(f"\n❌ Failed tests: {', '.join(failed_tests)}")
        return 1
    else:
        print("\n🎉 All tests passed!")
        return 0

if __name__ == "__main__":
    sys.exit(main())
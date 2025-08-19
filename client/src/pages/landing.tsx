import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChartLine, Shield, Calculator, TrendingUp, Users, Award } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <ChartLine className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-800">SIPVault</span>
          </div>
          
          <Button 
            onClick={() => window.location.href = "/auth/login"}
            className="bg-primary-600 hover:bg-primary-700"
            data-testid="button-login"
          >
            Login to Continue
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            Smart Investment Planning Made
            <span className="text-primary-600"> Simple</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            Take control of your financial future with our comprehensive SIP management platform. 
            Calculate, invest, and track your portfolio with powerful tools designed for modern investors.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => window.location.href = "/auth/login"}
              className="bg-primary-600 hover:bg-primary-700 text-lg px-8 py-4"
              data-testid="button-get-started"
            >
              Get Started Free
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-4 border-slate-300 hover:bg-slate-50"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Everything You Need for Smart Investing
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Comprehensive tools and features to help you make informed investment decisions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-slate-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Calculator className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Advanced Calculators</h3>
              <p className="text-slate-600">
                SIP, Step-up SIP, Goal-based planning, XIRR calculations, and Lumpsum vs SIP comparisons
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-success-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-success-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Portfolio Analytics</h3>
              <p className="text-slate-600">
                Real-time portfolio tracking, performance analytics, and detailed investment insights
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-warning-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-warning-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Secure & Reliable</h3>
              <p className="text-slate-600">
                Bank-grade security, encrypted transactions, and reliable investment processing
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ChartLine className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Multiple SIP Plans</h3>
              <p className="text-slate-600">
                Large Cap, Mid Cap, Small Cap funds with detailed performance history and risk analysis
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Admin Dashboard</h3>
              <p className="text-slate-600">
                Comprehensive admin tools for plan management, user KYC, and transaction monitoring
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Expert Support</h3>
              <p className="text-slate-600">
                Dedicated support team and comprehensive documentation to help you succeed
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white">
        <div className="container mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Investment Journey?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of investors who trust SIPVault for their systematic investment planning
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => window.location.href = "/api/login"}
            className="bg-white text-primary-600 hover:bg-gray-50 text-lg px-8 py-4"
            data-testid="button-start-investing"
          >
            Start Investing Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300">
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <ChartLine className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">SIPVault</span>
          </div>
          
          <div className="text-center">
            <p className="text-slate-400 mb-4">
              © 2023 SIPVault. All rights reserved.
            </p>
            <p className="text-sm text-slate-500">
              Smart Investment Planning Made Simple
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface AIResponse {
  response: string;
  intent: string;
  confidence: number;
}

@Injectable()
export class ChatbotAIService {
  private readonly logger = new Logger(ChatbotAIService.name);
  private readonly mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
  private mlServiceAvailable: boolean | null = null;
  private lastHealthCheck: number = 0;
  private readonly healthCheckInterval = 30000; // 30 seconds

  constructor() {
    this.logger.log(`ML Service URL: ${this.mlServiceUrl}`);
    // Initial health check
    this.checkMLServiceHealth();
    // Periodic health check every 30 seconds
    setInterval(() => this.checkMLServiceHealth(), 30000);
  }

  /**
   * Generate response - Single source of truth
   * Delegates to ML service, falls back to simple responses if unavailable
   */
  async generateResponse(
    userMessage: string,
    context: {
      userId: string;
      conversationId: string;
      intent?: string;
      context?: Record<string, any>;
    },
  ): Promise<AIResponse> {
    try {
      // Check ML service availability
      await this.ensureMLServiceAvailable();

      if (!this.mlServiceAvailable) {
        this.logger.debug('ML Service not available, using fallback responses');
        return this.getFallbackResponse(userMessage);
      }

      // Call ML service for full AI processing
      this.logger.debug(`Calling ML Service for message: "${userMessage.substring(0, 50)}..."`);
      const response = await axios.post(
        `${this.mlServiceUrl}/chat`,
        {
          message: userMessage,
          context: context.context || {},
          user_id: context.userId,
        },
        { timeout: 5000 }
      );

      this.logger.log(`✅ ML Service response received - Intent: ${response.data.intent}, Confidence: ${response.data.confidence}`);

      return {
        response: response.data.response,
        intent: response.data.intent,
        confidence: response.data.confidence,
      };
    } catch (error) {
      this.logger.error(`ML Service error: ${error.message}`);
      this.mlServiceAvailable = false;
      this.logger.warn('⚠️  Falling back to local responses');
      return this.getFallbackResponse(userMessage);
    }
  }

  /**
   * Check ML service health periodically
   */
  private async ensureMLServiceAvailable(): Promise<void> {
    const now = Date.now();
    
    // Only check if enough time has passed or if status is unknown
    if (this.mlServiceAvailable !== null && now - this.lastHealthCheck < this.healthCheckInterval) {
      return;
    }

    await this.checkMLServiceHealth();
  }

  /**
   * Health check for ML service
   */
  private async checkMLServiceHealth(): Promise<void> {
    try {
      this.logger.log('Checking ML Service health...');
      const response = await axios.get(`${this.mlServiceUrl}/health`, {
        timeout: 3000,
      });
      
      const wasAvailable = this.mlServiceAvailable;
      this.mlServiceAvailable = response.status === 200 && response.data?.status === 'ok';
      this.lastHealthCheck = Date.now();
      
      if (this.mlServiceAvailable && !wasAvailable) {
        this.logger.log('✅ ML Service is now AVAILABLE and CONNECTED');
      } else if (this.mlServiceAvailable) {
        this.logger.log('✅ ML Service health check: OK');
      }
    } catch (error) {
      const wasAvailable = this.mlServiceAvailable;
      this.mlServiceAvailable = false;
      this.lastHealthCheck = Date.now();
      
      if (wasAvailable !== false) {
        this.logger.warn(`❌ ML Service health check failed: ${error.message}`);
        this.logger.warn('⚠️  Chatbot will use fallback responses until ML service is available');
      }
    }
  }

  /**
   * Comprehensive fallback response generation
   * Matches the frontend's fallback exactly
   */
  private getFallbackResponse(message: string): AIResponse {
    const lowerMessage = message.toLowerCase();

    // ===== TWO‑SIDED COMMISSION MODEL (core monetization) =====
    if (lowerMessage.match(/\b(fee|fees|commission|how much (does it )?cost|pricing|price|payment model|monetization|platform fee|platform fees|what are the fees|how does pricing work|two-sided commission|2-sided commission|company fee|influencer fee|who pays|what do i pay|how much do i pay|cost structure)\b/)) {
      return {
        response: `Great question! Our platform uses a simple **two-sided commission model**:

💰 **For Companies:** 5% success fee on every completed collaboration
💰 **For Influencers:** 10% success fee on every completed collaboration

**How it works:**
- You only pay when a collaboration is successfully completed (no upfront costs)
- Fees are automatically deducted from the collaboration budget
- No subscriptions, no hidden charges
- Payment is held securely in escrow and released upon approval

**Example:**
If a company and influencer agree on a $1,000 collaboration:
- Company pays: $1,000 + 5% ($50) = $1,050 total
- Influencer receives: $1,000 - 10% ($100) = $900 net
- Platform earns: $150 total

**Why this model?**
- Aligns our success with yours—we only get paid when you do
- Keeps the platform free to use until you find a match
- Encourages high-quality, successful partnerships

Let me know if you'd like more details about payment processing or any other aspect!`,
        intent: 'fees',
        confidence: 0.8,
      };
    }

    // Why both parties pay?
    if (lowerMessage.match(/\bwhy (do|should) (both|influencers|companies) pay|why (does|are) (influencers|companies) (charged|paying)|why two-sided|why both sides pay\b/)) {
      return {
        response: `That's a fair question! The two-sided commission model is designed to be **fair and balanced**:

🤝 **Shared investment in success:** Both parties benefit from the match, so both contribute a small portion to support the platform that made it possible.

💡 **Lower overall cost:** By splitting the fee (5% + 10%), neither side bears the full burden. Compare that to a platform charging companies 15%—our combined 15% is the same total, but distributed more evenly.

🚀 **Better features for everyone:** The revenue allows us to continuously improve matching algorithms, provide secure payments, offer dispute resolution, and add new tools that benefit both companies and influencers.

🌟 **Transparency:** You always know exactly what you'll pay (or receive) before accepting a collaboration. No surprises.

Think of it as a small partnership fee—we succeed together! 😊`,
        intent: 'why_fees',
        confidence: 0.75,
      };
    }

    // Payment processing / how do I get paid / how do I pay
    if (lowerMessage.match(/\b(payment|pay|paid|receive money|get paid|transfer|withdraw|payout|how do i (pay|get paid)|payment method|payment process|escrow)\b/)) {
      return {
        response: `Our payment process is secure and straightforward:

**For Companies:**
1. After agreeing on terms, you fund the collaboration budget + 5% fee
2. Funds are held in escrow (fully protected)
3. You approve the work when completed
4. Payment is released to the influencer (minus their 10% fee)

**For Influencers:**
1. Accept a collaboration request with clear budget terms
2. Complete the work as agreed
3. Receive payment directly to your account after company approval
4. Withdraw to your bank, PayPal, or other methods

**Payment methods accepted:**
- Credit/debit cards
- PayPal
- Bank transfer (ACH/wire)
- Stripe

**Timeline:** Most payments process within 2-5 business days after approval.

**Security:** All funds are held in secure escrow until both parties confirm completion. This protects both sides!

Need help with a specific payment issue? Let me know!`,
        intent: 'payment',
        confidence: 0.75,
      };
    }

    // Comparison with other models (subscription vs commission)
    if (lowerMessage.match(/\b(compare|versus|vs|other models|subscription|subscription model|different pricing|alternative|why not subscription)\b/)) {
      return {
        response: `Great question! Here's why we chose the **two-sided commission model** over subscriptions or other approaches:

**Two-Sided Commission (our model):**
✅ Pay only when you succeed
✅ No monthly fees—perfect for occasional users
✅ Both parties share the cost fairly
✅ Scales with deal size (small fee for small deals)

**Subscription Model (e.g., monthly fee):**
❌ You pay even if you don't find a match
❌ Can be expensive for low-volume users
❌ Creates barrier to entry

**Company-Only Commission (e.g., 15% on companies):**
❌ Companies bear full cost (feels heavier)
❌ Influencers might not feel invested

**Our philosophy:** We believe in "shared success." By having both sides contribute a modest percentage only when a deal closes, we keep the platform accessible, fair, and aligned with your goals. No subscriptions, no hidden costs—just a small thank-you when we help you succeed. 😊

Let me know if you'd like to dive deeper into any aspect!`,
        intent: 'comparison',
        confidence: 0.7,
      };
    }

    // What if a collaboration is canceled or fails?
    if (lowerMessage.match(/\b(cancel|cancelled|refund|refunded|dispute|failed|unsuccessful|what if no deal|no collaboration|abandoned)\b/)) {
      return {
        response: `Good question! Here's how we handle cancellations and failed collaborations:

❌ **If a collaboration is canceled before work begins:**
- Full refund to the company (including the platform fee)
- Influencer receives nothing (no work, no pay)

❌ **If work is started but not completed (dispute):**
- Our support team mediates
- Depending on the situation, funds may be partially released or fully refunded
- Platform fees are adjusted accordingly

❌ **If a collaboration fails due to poor quality/non-delivery:**
- Company can dispute and request a refund
- We investigate and decide fair outcome
- Influencer may not receive payment

✅ **Successful collaborations only trigger fees**

We want you to feel safe using our platform. The escrow system ensures funds are protected, and our dispute resolution team is here to help if things go sideways.`,
        intent: 'cancellation',
        confidence: 0.7,
      };
    }

    // ===== GENERAL PLATFORM QUESTIONS =====

    // Greetings
    if (lowerMessage.match(/\b(hi|hello|hey|greetings|good morning|good afternoon|good evening|howdy|yo|sup|hiya|heya)\b/)) {
      return {
        response: 'Hello! 👋 I\'m your IC Match assistant. How can I help you today? I can answer questions about our two-sided commission model (5% for companies, 10% for influencers on successful deals), finding matches, managing collaborations, or anything else about the platform!',
        intent: 'greeting',
        confidence: 0.9,
      };
    }

    // Goodbye
    if (lowerMessage.match(/\b(bye|goodbye|see you|later|exit|quit|close|thanks bye|that\'s all|done|finished)\b/)) {
      return {
        response: 'Goodbye! Feel free to come back anytime! 👋 Remember, we only charge a small success fee when you complete a collaboration—otherwise it\'s free to use. Good luck with your partnerships!',
        intent: 'goodbye',
        confidence: 0.8,
      };
    }

    // Thanks
    if (lowerMessage.match(/\b(thanks|thank you|appreciate|thx|ty|helpful)\b/)) {
      return {
        response: 'You\'re very welcome! 😊 I\'m glad I could help. If you have more questions later, just say hi. Happy matching!',
        intent: 'thanks',
        confidence: 0.9,
      };
    }

    // Matching algorithm
    if (lowerMessage.match(/how (is|does|do|are).*(match|matching|algorithm|work)|matching algorithm|compatibility score|match score|how do you match|matching system|ai matching|how does the ai work|explain matching/)) {
      return {
        response: `Our AI-powered matching system analyzes multiple factors: 🧠

🎯 **Industry & Niche Compatibility** (25%)
💰 **Budget Alignment** (20%) — *Note: fees are added on top of budget*
📊 **Audience Demographics** (20%)
🎨 **Content Style & Values** (15%)
📈 **Past Collaboration Success** (10%)
⭐ **Profile Completeness** (10%)

The system calculates a compatibility score (0-100%) and ranks matches accordingly. Higher scores mean better compatibility!

And remember: the platform only takes a small success fee (5% companies, 10% influencers) when you actually collaborate—so feel free to explore as many matches as you like!`,
        intent: 'matching_algorithm',
        confidence: 0.75,
      };
    }

    // Finding matches
    if (lowerMessage.match(/\b(find|show|see|view|get|suggest|recommend).*(match|influencer|company|partner|brand|collaborator)|best matches|compatible matches|search for matches/)) {
      return {
        response: `I can help you find perfect matches! 🎯

**To get started:**
1️⃣ Go to the **Matches** page from the sidebar
2️⃣ Use filters to refine by industry, budget, location
3️⃣ View compatibility scores for each match
4️⃣ Click profiles to see detailed information

💡 **Tip:** You can also check **Suggested Matches** in your right sidebar for AI-recommended partners!

And don't worry about fees until you actually collaborate—browsing is completely free!`,
        intent: 'find_matches',
        confidence: 0.8,
      };
    }

    // Collaboration - how to start
    if (lowerMessage.match(/how.*(collab|collaborate|work together|partner|start project)|send collaboration request|propose partnership|start collaboration/)) {
      return {
        response: `Let's start a collaboration! 🤝

**Here's how:**
1️⃣ Find a match you like on the Matches page
2️⃣ Click on their profile
3️⃣ Click **Send Collaboration Request**
4️⃣ Fill in:
   • Project description
   • Budget range
   • Timeline
   • Deliverables
5️⃣ Send the request

They'll receive a notification and can accept, decline, or negotiate!

💰 **Fee reminder:** If accepted and successfully completed, companies pay a 5% success fee and influencers pay 10%—but only on the final collaboration amount. No fees for just chatting!`,
        intent: 'start_collaboration',
        confidence: 0.75,
      };
    }

    // Collaboration status
    if (lowerMessage.match(/my collaborations|collaboration status|pending requests|active collaborations|view requests|check collaborations|collaboration history|past collaborations/)) {
      return {
        response: `Check your collaboration status: 📋

• Go to **Connections** page
• View tabs:
  - **Pending:** Awaiting response
  - **Active:** Ongoing projects
  - **Completed:** Finished collaborations

You can also see collaboration requests in your Dashboard widget!

📊 After completion, fees are automatically processed based on your role (5% for companies, 10% for influencers).`,
        intent: 'collaboration_status',
        confidence: 0.7,
      };
    }

    // Analytics & Performance
    if (lowerMessage.match(/\b(stats|statistics|performance|analytics|metrics|data|report|dashboard|my data)\b/)) {
      return {
        response: `Let me pull up your performance metrics! 📊

Your Dashboard shows:
• Match success rate
• Response rate
• Active collaborations
• Profile views & engagement
• Earnings/spending trends
• Top performing content

Go to **Dashboard → Analytics** for detailed charts and insights!

💡 Pro tip: Use the analytics to see how your fees compare to your collaboration value—most users find the small percentage well worth the quality matches!`,
        intent: 'analytics',
        confidence: 0.7,
      };
    }

    // Profile management
    if (lowerMessage.match(/\b(profile|edit profile|update profile|change profile|my account|complete profile|profile completion|improve profile)\b/)) {
      return {
        response: `Profile optimization tips: 🌟

✅ Use professional photos
✅ Write detailed bio (150+ words)
✅ Add portfolio samples
✅ List specific niches
✅ Set accurate budget range
✅ Complete all sections
✅ Get verified

**Why it matters:** Complete profiles get 10x more visibility and higher-quality matches. And remember, you only pay fees when you collaborate—so polish that profile and start connecting!`,
        intent: 'profile',
        confidence: 0.7,
      };
    }

    // Portfolio
    if (lowerMessage.match(/portfolio|showcase|work samples|past work|examples|add portfolio|upload work|show my work/)) {
      return {
        response: `Build your portfolio: 📸

1️⃣ Go to **Profile → Portfolio**
2️⃣ Upload:
   • Images
   • Videos
   • Links to content
   • Case studies
3️⃣ Add descriptions
4️⃣ Organize by category

**Why it pays off:** Strong portfolios get 4x more collaboration requests! And since you only pay fees on successful deals, every piece of work you showcase is an investment in future earnings.`,
        intent: 'portfolio',
        confidence: 0.7,
      };
    }

    // Verification
    if (lowerMessage.match(/verify|verification|verified|get verified|verify account|verify profile|verification badge/)) {
      return {
        response: `Get verified: ✅

**Verification benefits:**
• Increased trust
• Higher visibility
• More matches
• Priority support

**How to verify:**
1️⃣ Go to Profile Settings
2️⃣ Click **Verify Account**
3️⃣ Submit required documents
4️⃣ Wait for approval (24-48 hours)

Verified accounts get 5x more engagement! And verification is completely free—we only charge success fees on collaborations, never for profile features.`,
        intent: 'verification',
        confidence: 0.7,
      };
    }

    // Messages & Communication
    if (lowerMessage.match(/\b(message|messages|inbox|chat|conversation|dm|direct message|message someone|how to message)\b/)) {
      return {
        response: `Access your messages: 💬

1️⃣ Click **Messages** in the sidebar
2️⃣ View all conversations
3️⃣ Send messages to connections
4️⃣ Get real-time notifications

**Note:** You can only message people you're connected with. Send a connection request first!

💡 Messaging is completely free—fees only apply when a collaboration is successfully completed.`,
        intent: 'messaging',
        confidence: 0.7,
      };
    }

    // Budget & Pricing (general)
    if (lowerMessage.match(/\b(budget|price|pricing|cost|how much|rates|pricing tiers|subscription)\b/)) {
      return {
        response: `Our platform uses a **two-sided commission model**:

• **Companies:** 5% success fee on completed collaborations
• **Influencers:** 10% success fee on completed collaborations

There are **no subscriptions or recurring fees**. You only pay when a collaboration successfully concludes.

**Example:** $1,000 deal → company pays $1,050 total, influencer receives $900 net.

Set your budget range in profile settings, and our AI will find compatible matches within your range!`,
        intent: 'budget',
        confidence: 0.7,
      };
    }

    // Payment methods (fallback)
    if (lowerMessage.match(/payment method|how to pay|payment options|credit card|paypal|bank transfer|payment processing/)) {
      return {
        response: `Accepted payment methods: 💳

• Credit/Debit cards
• PayPal
• Bank transfer (ACH/wire)
• Stripe

**Process:**
1. Agree on terms
2. Company funds escrow (budget + 5% fee)
3. Work completed & approved
4. Influencer receives budget minus 10%

All transactions are secure and protected. Need help with a specific payment? Let me know!`,
        intent: 'payment_methods',
        confidence: 0.7,
      };
    }

    // Platform features
    if (lowerMessage.match(/\b(feature|features|what can|capabilities|functions|platform features|what does this do|available features)\b/)) {
      return {
        response: `Platform features: 🚀

🎯 **AI-Powered Matching** — with compatibility scoring
🤝 **Collaboration Management** — end-to-end workflow
💬 **Direct Messaging** — real-time chat
📊 **Analytics Dashboard** — track performance
🔍 **Advanced Search & Filters**
⭐ **Profile Reviews & Ratings**
📱 **Mobile Responsive** — use anywhere
🔔 **Real-Time Notifications**
🎨 **Portfolio Showcase**
💰 **Secure Payments** — escrow protection
📈 **Performance Tracking**
🤖 **AI Chatbot Assistant** (that's me!)

And our **two-sided commission model** ensures you only pay when you succeed. All features are free to use until you close a deal!`,
        intent: 'features',
        confidence: 0.7,
      };
    }

    // Account & Settings
    if (lowerMessage.match(/\b(account|settings|preferences|configuration|setup|account settings|change settings|notification settings|privacy settings|security settings)\b/)) {
      return {
        response: `Manage your account: ⚙️

1️⃣ Click your avatar → **Settings**
2️⃣ Available options:
   • Notification preferences
   • Privacy settings
   • Display preferences
   • Email notifications
   • Password & security
   • Account information
   • Payment methods
   • Fee statements (view your transaction history)

Customize your experience to fit your needs!`,
        intent: 'settings',
        confidence: 0.7,
      };
    }

    // Search functionality
    if (lowerMessage.match(/\b(search|find|look for|looking for|how to search|search bar|search feature|find profiles)\b/)) {
      return {
        response: `Use our powerful search: 🔍

• Global search bar (top of page)
• Filter by:
  - Industry
  - Location
  - Budget range
  - Rating
  - Niche
• Sort by compatibility score
• Save search filters
• View trending profiles

**All free until you collaborate!** Try the search bar to find specific profiles instantly.`,
        intent: 'search',
        confidence: 0.7,
      };
    }

    // Notifications
    if (lowerMessage.match(/\b(notification|notifications|alert|alerts|updates|notification settings|turn off notifications|manage notifications)\b/)) {
      return {
        response: `Manage notifications: 🔔

• Bell icon shows all notifications
• Types:
  - Message notifications
  - Collaboration requests
  - Profile views
  - Match suggestions
  - System updates (including fee-related updates)

Customize in **Settings → Notifications**. Choose email, push, or in-app notifications!`,
        intent: 'notifications',
        confidence: 0.7,
      };
    }

    // Success tips
    if (lowerMessage.match(/\b(tips|advice|help me succeed|best practices|how to succeed|improve|get more matches|increase success|recommendations)\b/)) {
      return {
        response: `Tips for success: 🌟

✅ Complete your profile 100%
✅ Use professional photos
✅ Write detailed, authentic bio
✅ Be specific about your niche
✅ Respond quickly to messages (< 24hrs)
✅ Build genuine relationships
✅ Collect reviews from collaborations
✅ Update portfolio regularly
✅ Set realistic budgets
✅ Be professional and reliable

💡 **Remember:** You only pay fees when you succeed—so every match is a potential win with minimal risk. Profiles with 5+ reviews get 10x more matches!`,
        intent: 'tips',
        confidence: 0.7,
      };
    }

    // Industries & Niches
    if (lowerMessage.match(/\b(industry|industries|niche|niches|category|categories|sector|what industries|available industries)\b/)) {
      return {
        response: `Popular industries on our platform: 🎨

• Fashion & Beauty
• Fitness & Health
• Food & Beverage
• Travel & Lifestyle
• Gaming & Tech
• Music & Entertainment
• Education
• Home & Decor
• Business & Finance
• Sports & Outdoors
• Parenting & Family
• Art & Design

Select your industry in profile settings to get better matches! All industries have the same fee structure: 5% for companies, 10% for influencers on successful collaborations.`,
        intent: 'industries',
        confidence: 0.7,
      };
    }

    // Connection status
    if (lowerMessage.match(/\b(connect|connection|connected|accept|pending|connection request|send connection|accept connection)\b/)) {
      return {
        response: `About connections: 🤝

1️⃣ Send connection requests from profiles
2️⃣ Accept/decline incoming requests
3️⃣ View all connections in **Connections** page
4️⃣ Message connected users
5️⃣ Leave reviews after collaborations

Connections are the first step to collaboration—and they're free! Fees only apply when a collaboration is successfully completed.

💡 Tip: Personalize connection requests for better acceptance rates!`,
        intent: 'connections',
        confidence: 0.7,
      };
    }

    // Campaign system
    if (lowerMessage.match(/\b(campaign|campaigns|project|projects|create campaign|view campaigns|campaign system|browse campaigns)\b/)) {
      return {
        response: `Campaign system: 📋

🏢 **For Companies:**
1. Create campaigns (free to create)
2. Set goals, budget, timeline
3. Review influencer applications
4. Select collaborators
5. Track progress
6. Upon successful completion, pay 5% success fee

🎯 **For Influencers:**
1. Browse campaigns (free)
2. Apply to relevant ones
3. Wait for approval
4. Start collaboration
5. Deliver content
6. Upon successful completion, pay 10% success fee

Check **Campaigns** page to browse opportunities! All campaign browsing and applications are free—fees only apply to completed collaborations.`,
        intent: 'campaigns',
        confidence: 0.7,
      };
    }

    // Reviews & Ratings
    if (lowerMessage.match(/\b(review|reviews|rating|ratings|feedback|testimonial|leave review|rate|reputation)\b/)) {
      return {
        response: `Reviews & ratings: ⭐

• Leave reviews after collaborations
• Rate:
  - Professionalism
  - Communication
  - Quality of work
  - Timeliness
• Reviews appear on profiles
• Build your reputation
• Get verified collaboration badges

Good reviews lead to more opportunities—and more successful collaborations (which means more fees, but also more earnings!). Tip: Be honest and constructive in your feedback!`,
        intent: 'reviews',
        confidence: 0.7,
      };
    }

    // Response Time
    if (lowerMessage.match(/response time|how long|when will they respond|reply time|waiting for response|no response/)) {
      return {
        response: `About response times: ⏱️

• Most users respond within 24-48 hours
• Check their profile for average response time
• Send a polite follow-up after 3 days
• Some users have auto-responders

Tip: Users with faster response times are marked with a ⚡ badge!

⏳ While waiting, you can explore other matches—browsing is always free.`,
        intent: 'response_time',
        confidence: 0.7,
      };
    }

    // Contract & Agreement
    if (lowerMessage.match(/contract|agreement|terms|legal|sign contract|collaboration agreement|terms of service/)) {
      return {
        response: `Contracts & agreements: 📄

• Platform provides contract templates
• Customize for your collaboration
• Both parties must agree
• Digital signatures supported
• Stored securely in platform

Always use contracts for:
• Payment terms
• Deliverables
• Timeline
• Rights & usage
• Fee acknowledgment (both parties confirm the success fees)

Protect yourself and your partner! Our ToS are available in the footer.`,
        intent: 'contract',
        confidence: 0.7,
      };
    }

    // Dispute Resolution
    if (lowerMessage.match(/dispute|problem with collaboration|disagreement|conflict|resolve dispute|mediation|complaint/)) {
      return {
        response: `Dispute resolution: ⚖️

If issues arise:
1️⃣ Try to resolve directly first
2️⃣ Document everything
3️⃣ Contact platform support
4️⃣ Mediation available
5️⃣ Review contract terms

**Fee implications:** If a collaboration is canceled or partially completed, fees may be adjusted or refunded. We're here to help both parties reach a fair resolution.

Contact: support@icmatch.com`,
        intent: 'dispute',
        confidence: 0.7,
      };
    }

    // Data Export
    if (lowerMessage.match(/export data|download data|export analytics|get my data|data export|download report/)) {
      return {
        response: `Export your data: 📥

• Analytics → Export Report
• Choose format: PDF, CSV, Excel
• Select date range
• Download instantly

Available exports:
• Performance reports
• Collaboration history (including fees paid/earned)
• Financial statements
• Profile data

Go to **Settings → Data Export**`,
        intent: 'data_export',
        confidence: 0.7,
      };
    }

    // Delete Account
    if (lowerMessage.match(/delete account|close account|remove account|deactivate|cancel account|delete profile/)) {
      return {
        response: `Account deletion: 🗑️

Before you go:
• Export your data first
• Complete pending collaborations
• Withdraw remaining balance

To delete:
1️⃣ Settings → Account
2️⃣ **Delete Account**
3️⃣ Confirm deletion
4️⃣ Account removed in 30 days

We're sad to see you go! If you're leaving because of fees, remember you only pay when you succeed—no subscriptions. Can I help with anything?`,
        intent: 'delete_account',
        confidence: 0.7,
      };
    }

    // Referral Program
    if (lowerMessage.match(/referral|refer friend|invite|referral program|earn rewards|invite users/)) {
      return {
        response: `Referral program: 🎁

• Invite friends to join
• Earn rewards for each signup
• Get bonus for completed collaborations
• Track referrals in Dashboard

**How to refer:**
1️⃣ Dashboard → Referrals
2️⃣ Copy your unique link
3️⃣ Share with friends
4️⃣ Earn rewards!

Both you and your friend get bonuses! (Note: referral bonuses are separate from success fees.)`,
        intent: 'referral',
        confidence: 0.7,
      };
    }

    // Mobile App
    if (lowerMessage.match(/mobile app|app|download app|ios|android|mobile version|phone app/)) {
      return {
        response: `Mobile experience: 📱

• Fully responsive web app
• Works on all devices
• No download needed
• Add to home screen for app-like experience

iOS: Safari → Share → Add to Home Screen
Android: Chrome → Menu → Add to Home Screen

Native apps coming soon! And just like on desktop, you only pay success fees on completed collaborations.`,
        intent: 'mobile',
        confidence: 0.7,
      };
    }

    // Language Support
    if (lowerMessage.match(/language|languages|translate|translation|other languages|change language|multilingual/)) {
      return {
        response: `Language support: 🌍

Currently available:
• English (primary)

Coming soon:
• Spanish
• French
• German
• Portuguese
• More languages

Change language: **Settings → Language**

Need help in another language? Contact support! Our fee structure is the same worldwide: 5% companies, 10% influencers.`,
        intent: 'language',
        confidence: 0.7,
      };
    }

    // API Integration
    if (lowerMessage.match(/api|integration|developer|api access|integrate|api documentation|webhook/)) {
      return {
        response: `API & Integrations: 🔌

• REST API available
• Webhook support
• OAuth authentication
• Rate limiting applied

Developer resources:
• API documentation
• Code examples
• SDKs (coming soon)

**Note:** Fees apply to collaborations initiated via API just like any other collaboration—5% companies, 10% influencers.

Contact: developers@icmatch.com for API access`,
        intent: 'api',
        confidence: 0.7,
      };
    }

    // Technical issues
    if (lowerMessage.match(/\b(error|bug|issue|problem|not working|broken|fix|technical issue|something wrong|doesn't work)\b/)) {
      return {
        response: `Having technical issues? 🔧

Quick fixes:
1️⃣ Refresh the page (F5)
2️⃣ Clear browser cache
3️⃣ Log out and log back in
4️⃣ Check internet connection
5️⃣ Try different browser
6️⃣ Disable browser extensions

Still having issues? Contact support at support@icmatch.com

Most issues are resolved with a quick refresh! (And no, refreshing won't trigger any fees 😉)`,
        intent: 'technical',
        confidence: 0.7,
      };
    }

    // Getting started
    if (lowerMessage.match(/\b(start|begin|getting started|new user|first time|onboard|how to start|new here|just joined)\b/)) {
      return {
        response: `Welcome to IC Match! 🎉

**Getting started:**
1️⃣ Complete your profile (100%)
2️⃣ Set your preferences
3️⃣ Browse matches
4️⃣ Send connection requests
5️⃣ Start conversations
6️⃣ Propose collaborations

**💰 Fee reminder:** You only pay when a collaboration is successfully completed:
- Companies: 5% success fee
- Influencers: 10% success fee
No subscriptions, no hidden costs.

Take the profile setup wizard for guided onboarding! Need help? I'm here to answer any questions!`,
        intent: 'getting_started',
        confidence: 0.8,
      };
    }

    // Safety & Security
    if (lowerMessage.match(/\b(safe|safety|secure|security|privacy|protect|scam|fraud|trust|verification|is this safe)\b/)) {
      return {
        response: `Your safety matters: 🔒

✅ All data is encrypted
✅ Verified profiles available
✅ Secure payment processing (escrow)
✅ Report suspicious activity
✅ Privacy controls
✅ Email verification required
✅ Two-factor authentication
✅ Secure messaging

💰 **Financial safety:** Funds are held in escrow and only released upon approval. Platform fees (5% companies, 10% influencers) are transparent and shown before you commit.

⚠️ Never share personal payment info outside the platform! Report any suspicious behavior immediately.`,
        intent: 'safety',
        confidence: 0.7,
      };
    }

    // Help & Support
    if (lowerMessage.match(/\b(help|support|assist|contact|customer service|guide|tutorial|instructions)\b/)) {
      return {
        response: `I'm here to help! I can assist you with:

💰 **Fees & Payments** — 5% companies, 10% influencers on successful deals
🎯 **Finding perfect matches**
🤝 **Sending collaboration requests**
📊 **Viewing your analytics**
✏️ **Managing your profile**
💬 **Using messaging features**
⚙️ **Platform settings**

What would you like to know more about?`,
        intent: 'help',
        confidence: 0.8,
      };
    }

    // ===== ADDITIONAL TOPICS FROM FRONTEND =====

    // Data privacy / GDPR / CCPA
    if (lowerMessage.match(/\b(privacy|data privacy|gdpr|ccpa|personal data|data protection|your data|my data|data usage)\b/)) {
      return {
        response: `Your privacy is important to us! 🔐

**How we handle your data:**
• We collect only necessary information for matching and collaborations
• Your data is encrypted and stored securely
• We never sell your personal information to third parties
• You can request a copy of your data or deletion anytime

**Privacy rights:**
- Access your data in Settings
- Export your data (GDPR/CCPA compliant)
- Delete your account and data

Read our full Privacy Policy in the footer or at /privacy. Questions? Contact privacy@icmatch.com.`,
        intent: 'privacy',
        confidence: 0.7,
      };
    }

    // Two-factor authentication / 2FA
    if (lowerMessage.match(/\b(2fa|two factor|two-factor|multi factor|mfa|authenticator|security code|2 step verification)\b/)) {
      return {
        response: `Yes, we support Two-Factor Authentication (2FA)! 🔐

**Enable 2FA for extra security:**
1️⃣ Go to **Settings → Security**
2️⃣ Click **Enable Two-Factor Authentication**
3️⃣ Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
4️⃣ Enter the verification code
5️⃣ Save your backup codes in a safe place

Once enabled, you'll need both your password and a code from your authenticator app to log in. Highly recommended!`,
        intent: '2fa',
        confidence: 0.7,
      };
    }

    // Account types / roles
    if (lowerMessage.match(/\b(account type|role|switch role|change role|influencer or company|both roles|multiple roles)\b/)) {
      return {
        response: `**Account roles on our platform:**

👤 **Influencer:** Create content, collaborate with brands, build your portfolio
🏢 **Company:** Find influencers, create campaigns, promote your products

**Can you have both roles?** Currently, each account is tied to a single role. If you need both, you can create two separate accounts with different emails, or contact support for assistance.

**Switching roles?** If you registered as the wrong type, you can change it in **Settings → Account Information** (limited to once every 30 days).`,
        intent: 'roles',
        confidence: 0.7,
      };
    }

    // Exclusivity / non-compete
    if (lowerMessage.match(/\b(exclusive|exclusivity|non-compete|work with competitors|multiple brands|multiple influencers)\b/)) {
      return {
        response: `**Exclusivity and non-compete** are handled between you and your collaboration partner.

🤝 **Platform policy:** We don't enforce exclusivity unless agreed in your contract. You're free to work with multiple brands or influencers simultaneously.

📝 **Contract terms:** If exclusivity is important, include it in your collaboration agreement (template available). Specify:
- Duration of exclusivity
- Scope (e.g., category, platform)
- Compensation

Always clarify expectations upfront!`,
        intent: 'exclusivity',
        confidence: 0.7,
      };
    }

    // Rights and usage / intellectual property
    if (lowerMessage.match(/\b(rights|usage rights|intellectual property|ip|ownership|who owns|license|content rights)\b/)) {
      return {
        response: `**Intellectual Property & Usage Rights** – a common question! 📝

By default, when a collaboration is completed and paid:
- **Influencer grants the company** a license to use the created content for the agreed purpose (e.g., social media, ads)
- **Influencer retains ownership** of their original work unless explicitly transferred

**You can customize rights in the collaboration agreement:**
• Exclusive vs non-exclusive
• Time-limited vs perpetual
• Geographic restrictions
• Additional usage fees

Always discuss and agree on rights before starting work! Need help? Use our contract templates.`,
        intent: 'rights',
        confidence: 0.7,
      };
    }

    // Time to find a match
    if (lowerMessage.match(/\b(how long does it take|time to find|average time|when will i find|match speed)\b/)) {
      return {
        response: `⏱️ **How long does it take to find a match?**

It varies, but here's what we see:
• **Active users** with complete profiles: 1-2 weeks on average
• **Niche industries** may take a bit longer
• **High-demand categories** (like fashion, tech) often match within days

**Tips to speed up:**
✅ Complete your profile 100%
✅ Set clear budget expectations
✅ Be responsive to messages
✅ Send personalized connection requests
✅ Apply to relevant campaigns

Remember: you can browse and connect while you wait—it's all free!`,
        intent: 'match_time',
        confidence: 0.7,
      };
    }

    // Can I message without connecting?
    if (lowerMessage.match(/message without connecting|dm without connection|contact directly|send message before connect/)) {
      return {
        response: `🔒 **Messaging policy:** For privacy and spam prevention, you can only message users after you've connected with them.

**How to connect:**
1️⃣ Find a profile you're interested in
2️⃣ Click **Connect** (on their profile or matches page)
3️⃣ They'll receive a request; once accepted, you can message freely

**Why this rule?**
- Prevents unsolicited spam
- Ensures mutual interest
- Creates a safer environment

If you're trying to reach someone specific, send a connection request with a personalized note—it increases acceptance chances!`,
        intent: 'messaging_policy',
        confidence: 0.7,
      };
    }

    // Can I export chat history?
    if (lowerMessage.match(/export chat|download messages|save conversation|chat history export/)) {
      return {
        response: `📥 **Exporting chat history:** Currently, you can view your full message history in the Messages page. For exporting:

**Individual conversation:**
- Open the conversation
- Click the menu (three dots) in the top right
- Select **Export Chat** (downloads as .txt or .pdf)

**All messages (bulk export):**
- Go to **Settings → Data Export**
- Choose **Messages** under data types
- Select date range and format
- Request export (you'll receive an email with download link)

Need help? Contact support!`,
        intent: 'export_chat',
        confidence: 0.7,
      };
    }

    // Block or report a user
    if (lowerMessage.match(/\b(block user|report user|unwanted|harassment|spam|inappropriate|flag user)\b/)) {
      return {
        response: `**Blocking & Reporting Users** 🚫

If you encounter inappropriate behavior or spam:

**To block a user:**
1️⃣ Go to their profile
2️⃣ Click the three-dot menu (top right)
3️⃣ Select **Block User**
4️⃣ Confirm

**To report a user:**
1️⃣ On their profile, click **Report User**
2️⃣ Choose a reason (harassment, spam, inappropriate content, etc.)
3️⃣ Add details (optional)
4️⃣ Submit

Our moderation team reviews reports within 24 hours. Blocked users cannot message you or see your profile. Your safety is our priority!`,
        intent: 'block_report',
        confidence: 0.7,
      };
    }

    // Can I change my username?
    if (lowerMessage.match(/change username|update username|display name|edit name/)) {
      return {
        response: `**Changing your username/display name:** ✏️

**Display Name:** You can change this anytime in **Settings → Profile**. This is what others see.

**Username (handle):** For security and consistency, usernames cannot be changed after registration. If you absolutely need a different username, you'd need to create a new account (with a different email) or contact support for special cases.

**Tip:** Choose a professional username that reflects your brand—it's permanent!`,
        intent: 'username',
        confidence: 0.7,
      };
    }

    // How to delete a campaign
    if (lowerMessage.match(/delete campaign|remove campaign|cancel campaign|stop campaign/)) {
      return {
        response: `**Deleting or pausing a campaign:** 📋

**To delete a draft campaign:** Go to Campaigns → Drafts, click the trash icon.

**To cancel an active campaign:**
1️⃣ Open the campaign
2️⃣ Click **Edit Campaign**
3️⃣ Scroll to bottom and click **Cancel Campaign**
4️⃣ Confirm

⚠️ Note: If you've already accepted applications, you'll need to notify applicants. Canceling may affect your response rate metrics.

**To pause (temporarily hide):** You can set campaign status to "Paused" instead of deleting.`,
        intent: 'delete_campaign',
        confidence: 0.7,
      };
    }

    // How to withdraw money (for influencers)
    if (lowerMessage.match(/withdraw|withdrawal|get money|cash out|transfer to bank/)) {
      return {
        response: `**Withdrawing your earnings** (for influencers): 💵

Once a collaboration is completed and payment is released to your account balance:

**To withdraw:**
1️⃣ Go to **Wallet** (or **Earnings** in Dashboard)
2️⃣ Click **Withdraw Funds**
3️⃣ Choose your payout method:
   - Bank transfer (ACH) – 1-3 business days
   - PayPal – instant
   - Payoneer – 1-2 days
4️⃣ Enter amount and confirm

**Minimum withdrawal:** $20
**Fees:** None from us—but your payment provider may charge a small fee.

**Note:** Funds are held securely until you withdraw. Need help? Let me know!`,
        intent: 'withdraw',
        confidence: 0.7,
      };
    }

    // Tax information / 1099
    if (lowerMessage.match(/\b(tax|taxes|1099|w-9|vat|gst|invoice|receipt)\b/)) {
      return {
        response: `**Tax Information** 🧾

**For Influencers:**
- You are responsible for reporting your earnings and paying applicable taxes
- At year-end, we provide a **1099 form** (for US users earning over $600) and **earnings summary**
- Download tax documents in **Settings → Tax Information**

**For Companies:**
- You can download invoices for all payments in **Billing → Invoices**
- The platform fee (5%) is included in your invoice

**VAT/GST:** If applicable, taxes are calculated based on your location and added at checkout.

Questions? Consult a tax professional—we can't give tax advice!`,
        intent: 'tax',
        confidence: 0.7,
      };
    }

    // Affiliate program details
    if (lowerMessage.match(/\b(affiliate|affiliate program|earn money by referring|referral commission)\b/)) {
      return {
        response: `**Affiliate Program** – Earn by referring users! 🎁

**How it works:**
1️⃣ Sign up for our affiliate program (free)
2️⃣ Get your unique referral link
3️⃣ Share it with friends, followers, or on social media
4️⃣ Earn commission when they complete their first collaboration

**Commission rates:**
• For each referred **company** that completes a collaboration: $50
• For each referred **influencer** that completes a collaboration: $25
• Plus 5% of platform fees from their first 3 collaborations

**Track earnings:** Dashboard → Affiliate

Interested? Visit /affiliate or contact affiliates@icmatch.com!`,
        intent: 'affiliate',
        confidence: 0.7,
      };
    }

    // Platform uptime / status
    if (lowerMessage.match(/\b(down|site down|platform not working|status page|outage|maintenance)\b/)) {
      return {
        response: `**Platform Status** 🟢

We strive for 99.9% uptime. If you're experiencing issues:

🔍 **Check our status page:** status.icmatch.com (real-time updates)
🛠️ **Scheduled maintenance:** Announced 24h in advance via email and banner
📢 **Incident reports:** Posted on status page within minutes

**Quick checks:**
- Try refreshing
- Clear cache
- Check internet connection
- See if others are reporting issues on social media

If problems persist, contact support@icmatch.com. We're on it!`,
        intent: 'uptime',
        confidence: 0.7,
      };
    }

    // How to become a verified influencer
    if (lowerMessage.match(/\b(verified influencer|get verified|verification process|verified badge)\b/)) {
      return {
        response: `**Becoming a Verified Influencer** ✅

Verification adds trust and boosts your visibility!

**Requirements:**
• Active account for at least 30 days
• Minimum 5 completed collaborations with positive reviews
• Complete profile (100%)
• Valid ID verification

**How to apply:**
1️⃣ Go to **Settings → Verification**
2️⃣ Click **Apply for Verification**
3️⃣ Submit required documents (ID, proof of identity)
4️⃣ Wait for review (usually 24-48 hours)

**Benefits:**
• Verified badge on profile
• Higher search ranking
• Priority in matches
• Trust signal for companies

Start building your reputation today!`,
        intent: 'verify_influencer',
        confidence: 0.7,
      };
    }

    // How to become a verified company
    if (lowerMessage.match(/\b(verified company|company verification|business verification)\b/)) {
      return {
        response: `**Company Verification** – Establish trust! 🏢

Verified companies get priority visibility and are preferred by top influencers.

**Requirements:**
• Registered business entity
• Valid tax ID / business license
• Official website and email
• At least one completed collaboration or $500 in platform spend

**How to verify:**
1️⃣ Settings → Company Verification
2️⃣ Upload business documents
3️⃣ Verify business email
4️⃣ Submit for review (1-2 business days)

**Benefits:**
• Verified badge
• Higher trust score
• Featured in search results
• Access to exclusive campaigns

Verification is free—just takes a bit of paperwork!`,
        intent: 'verify_company',
        confidence: 0.7,
      };
    }

    // Cancel collaboration request
    if (lowerMessage.match(/cancel collaboration request|withdraw request|unsend request/)) {
      return {
        response: `**Canceling a Collaboration Request** ❌

If you sent a request and want to cancel:

**If the request is pending (not yet accepted):**
1️⃣ Go to **Connections → Sent Requests**
2️⃣ Find the request
3️⃣ Click **Cancel Request**
4️⃣ Confirm

**If already accepted:** You'll need to discuss with the other party—you can mutually cancel via the collaboration page (both parties must agree).

**Note:** Canceled requests don't affect your metrics, but frequent cancellations may impact your response rate.`,
        intent: 'cancel_request',
        confidence: 0.7,
      };
    }

    // Default unknown response with suggestions
    return {
      response: `I'm not sure I understand that specific question. 🤔

I can help you with:
💰 **Fees & Payments** — our two-sided commission model (5% companies, 10% influencers on successful collaborations)
🎯 **Finding matches**
🤝 **Starting collaborations**
📊 **Viewing analytics**
✏️ **Managing your profile**
💬 **Messaging & notifications**
🎯 **Platform features**

What would you like to know more about?`,
      intent: 'unknown',
      confidence: 0.3,
    };
  }

  /**
   * Get ML service status
   */
  async getServiceStatus(): Promise<{ available: boolean; lastCheck: Date }> {
    return {
      available: this.mlServiceAvailable ?? false,
      lastCheck: new Date(this.lastHealthCheck),
    };
  }
}
import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiMinus, FiSend } from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri';
import { useChatbot } from '../../hooks/useChatbot';
import { useAuth } from '../../contexts/AuthContext';
import './ChatbotWidget.css';

// Helper function to format message content with line breaks, bold, and lists
const formatMessage = (content: string): React.ReactNode => {
  if (!content) return null;

  // Split by line breaks
  const lines = content.split('\n');
  
  return lines.map((line, index) => {
    // Handle empty lines (just a line break)
    if (line.trim() === '') {
      return <br key={`br-${index}`} />;
    }

    // Process bold text: replace **text** with <strong>text</strong>
    const processBold = (text: string) => {
      const parts = text.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });
    };

    // Check if line starts with a bullet point (•, -, *, →, etc.)
    const bulletMatch = line.match(/^([•\-*→])\s+(.*)/);
    if (bulletMatch) {
      return (
        <div key={index} style={{ display: 'flex', alignItems: 'flex-start', marginLeft: '1rem', marginBottom: '0.25rem' }}>
          <span style={{ marginRight: '0.5rem', flexShrink: 0 }}>{bulletMatch[1]}</span>
          <span>{processBold(bulletMatch[2])}</span>
        </div>
      );
    }

    // Check if line starts with a number emoji like 1️⃣, 2️⃣, etc.
    const numEmojiMatch = line.match(/^(\d️⃣)\s+(.*)/);
    if (numEmojiMatch) {
      return (
        <div key={index} style={{ display: 'flex', alignItems: 'flex-start', marginLeft: '1rem', marginBottom: '0.25rem' }}>
          <span style={{ marginRight: '0.5rem', flexShrink: 0 }}>{numEmojiMatch[1]}</span>
          <span>{processBold(numEmojiMatch[2])}</span>
        </div>
      );
    }

    // Check if line starts with a number and period (e.g., "1. ")
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      return (
        <div key={index} style={{ display: 'flex', alignItems: 'flex-start', marginLeft: '1rem', marginBottom: '0.25rem' }}>
          <span style={{ marginRight: '0.5rem', flexShrink: 0 }}>{numberedMatch[1]}.</span>
          <span>{processBold(numberedMatch[2])}</span>
        </div>
      );
    }

    // Regular paragraph
    return <p key={index} style={{ margin: '0.25rem 0', whiteSpace: 'pre-wrap' }}>{processBold(line)}</p>;
  });
};

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [localMessages, setLocalMessages] = useState<Array<{
    id: string;
    content: string;
    senderType: 'user' | 'bot';
    createdAt: string;
  }>>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  const { sendMessage, isConnected, connect, disconnect, messages: wsMessages, isTyping, clearMessages } = useChatbot();

  // Combine WebSocket messages with local messages
  const messages = isConnected ? wsMessages : localMessages;
  const setMessages = isConnected ? () => { } : setLocalMessages;

  // Handle click outside to close chatbot
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        handleMinimize();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (user && isOpen) {
      // Try to connect, but don't block UI if it fails
      connect();
    }
    return () => {
      if (isOpen) {
        disconnect();
      }
    };
  }, [user, isOpen, connect, disconnect]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleToggle = () => {
    if (isMinimized) {
      setIsMinimized(false);
      setIsOpen(true);
    } else {
      handleMinimize();
    }
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    setIsOpen(false);
    // Clear messages when closing
    setLocalMessages([]);
    clearMessages();
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const messageContent = inputValue.trim();
    setInputValue('');

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    try {
      // Add user message immediately to UI
      const userMessage = {
        id: Date.now().toString(),
        content: messageContent,
        senderType: 'user' as const,
        createdAt: new Date().toISOString(),
      };

      // Update messages state directly if not connected
      if (!isConnected) {
        setMessages(prev => [...prev, userMessage]);

        // Simulate bot response with fallback
        setTimeout(() => {
          const botMessage = {
            id: (Date.now() + 1).toString(),
            content: getFallbackResponse(messageContent),
            senderType: 'bot' as const,
            createdAt: new Date().toISOString(),
          };
          setMessages(prev => [...prev, botMessage]);
        }, 500);
      } else {
        // Use WebSocket if connected
        await sendMessage(messageContent);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Add error message to chat
      const errorMessage = {
        id: (Date.now() + 2).toString(),
        content: "Sorry, I'm having trouble responding right now. Please try again.",
        senderType: 'bot' as const,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const getFallbackResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();

    // ===== CORE MONETIZATION / TWO-SIDED COMMISSION MODEL =====
    if (lowerMessage.match(/\b(fee|fees|commission|how much (does it )?cost|pricing|price|payment model|monetization|platform fee|platform fees|what are the fees|how does pricing work|two-sided commission|2-sided commission|company fee|influencer fee|who pays|what do i pay|how much do i pay|cost structure)\b/)) {
      return `Great question! Our platform uses a simple **two-sided commission model**:

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

Let me know if you'd like more details about payment processing or any other aspect!`;
    }

    // Why both parties pay?
    if (lowerMessage.match(/\bwhy (do|should) (both|influencers|companies) pay|why (does|are) (influencers|companies) (charged|paying)|why two-sided|why both sides pay\b/)) {
      return `That's a fair question! The two-sided commission model is designed to be **fair and balanced**:

🤝 **Shared investment in success:** Both parties benefit from the match, so both contribute a small portion to support the platform that made it possible.

💡 **Lower overall cost:** By splitting the fee (5% + 10%), neither side bears the full burden. Compare that to a platform charging companies 15%—our combined 15% is the same total, but distributed more evenly.

🚀 **Better features for everyone:** The revenue allows us to continuously improve matching algorithms, provide secure payments, offer dispute resolution, and add new tools that benefit both companies and influencers.

🌟 **Transparency:** You always know exactly what you'll pay (or receive) before accepting a collaboration. No surprises.

Think of it as a small partnership fee—we succeed together! 😊`;
    }

    // Payment processing / how do I get paid / how do I pay
    if (lowerMessage.match(/\b(payment|pay|paid|receive money|get paid|transfer|withdraw|payout|how do i (pay|get paid)|payment method|payment process|escrow)\b/)) {
      return `Our payment process is secure and straightforward:

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

Need help with a specific payment issue? Let me know!`;
    }

    // Comparison with other models (if user asks about subscriptions or other pricing)
    if (lowerMessage.match(/\b(compare|versus|vs|other models|subscription|subscription model|different pricing|alternative|why not subscription)\b/)) {
      return `Great question! Here's why we chose the **two-sided commission model** over subscriptions or other approaches:

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

Let me know if you'd like to dive deeper into any aspect!`;
    }

    // What if a collaboration is canceled or fails?
    if (lowerMessage.match(/\b(cancel|cancelled|refund|refunded|dispute|failed|unsuccessful|what if no deal|no collaboration|abandoned)\b/)) {
      return `Good question! Here's how we handle cancellations and failed collaborations:

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

We want you to feel safe using our platform. The escrow system ensures funds are protected, and our dispute resolution team is here to help if things go sideways.

Anything else you'd like to know about safety?`;
    }

    // ===== EXISTING PATTERNS (enhanced with monetization context where relevant) =====

    // Greetings
    if (lowerMessage.match(/\b(hi|hello|hey|greetings|good morning|good afternoon|good evening|howdy|yo|sup|hiya|heya)\b/)) {
      return 'Hello! 👋 I\'m your IC Match assistant. How can I help you today? I can answer questions about our two-sided commission model (5% for companies, 10% for influencers on successful deals), finding matches, managing collaborations, or anything else about the platform!';
    }

    // Goodbye
    if (lowerMessage.match(/\b(bye|goodbye|see you|later|exit|quit|close|thanks bye|that\'s all|done|finished)\b/)) {
      return 'Goodbye! Feel free to come back anytime! 👋 Remember, we only charge a small success fee when you complete a collaboration—otherwise it\'s free to use. Good luck with your partnerships!';
    }

    // Thanks
    if (lowerMessage.match(/\b(thanks|thank you|appreciate|thx|ty|helpful)\b/)) {
      return 'You\'re very welcome! 😊 I\'m glad I could help. If you have more questions later, just say hi. Happy matching!';
    }

    // Matching Algorithm - How it works (enhanced with monetization note)
    if (lowerMessage.match(/how (is|does|do|are).*(match|matching|algorithm|work)|matching algorithm|compatibility score|match score|how do you match|matching system|ai matching|how does the ai work|explain matching/)) {
      return `Our AI-powered matching system analyzes multiple factors: 🧠

🎯 **Industry & Niche Compatibility** (25%)
💰 **Budget Alignment** (20%) — *Note: fees are added on top of budget*
📊 **Audience Demographics** (20%)
🎨 **Content Style & Values** (15%)
📈 **Past Collaboration Success** (10%)
⭐ **Profile Completeness** (10%)

The system calculates a compatibility score (0-100%) and ranks matches accordingly. Higher scores mean better compatibility!

And remember: the platform only takes a small success fee (5% companies, 10% influencers) when you actually collaborate—so feel free to explore as many matches as you like!`;
    }

    // Finding matches (enhanced with note about fees)
    if (lowerMessage.match(/\b(find|show|see|view|get|suggest|recommend).*(match|influencer|company|partner|brand|collaborator)|best matches|compatible matches|search for matches/)) {
      return 'I can help you find perfect matches! 🎯\n\n**To get started:**\n1️⃣ Go to the **Matches** page from the sidebar\n2️⃣ Use filters to refine by industry, budget, location\n3️⃣ View compatibility scores for each match\n4️⃣ Click profiles to see detailed information\n\n💡 **Tip:** You can also check **Suggested Matches** in your right sidebar for AI-recommended partners!\n\nAnd don\'t worry about fees until you actually collaborate—browsing is completely free!';
    }

    // Collaboration - How to start (with fee mention)
    if (lowerMessage.match(/how.*(collab|collaborate|work together|partner|start project)|send collaboration request|propose partnership|start collaboration/)) {
      return `Let's start a collaboration! 🤝

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

💰 **Fee reminder:** If accepted and successfully completed, companies pay a 5% success fee and influencers pay 10%—but only on the final collaboration amount. No fees for just chatting!`;
    }

    // Collaboration Status
    if (lowerMessage.match(/my collaborations|collaboration status|pending requests|active collaborations|view requests|check collaborations|collaboration history|past collaborations/)) {
      return 'Check your collaboration status: 📋\n\n• Go to **Connections** page\n• View tabs:\n  - **Pending:** Awaiting response\n  - **Active:** Ongoing projects\n  - **Completed:** Finished collaborations\n\nYou can also see collaboration requests in your Dashboard widget!\n\n📊 After completion, fees are automatically processed based on your role (5% for companies, 10% for influencers).';
    }

    // Analytics & Performance
    if (lowerMessage.match(/\b(stats|statistics|performance|analytics|metrics|data|report|dashboard|my data)\b/)) {
      return 'Let me pull up your performance metrics! 📊\n\nYour Dashboard shows:\n• Match success rate\n• Response rate\n• Active collaborations\n• Profile views & engagement\n• Earnings/spending trends\n• Top performing content\n\nGo to **Dashboard → Analytics** for detailed charts and insights!\n\n💡 Pro tip: Use the analytics to see how your fees compare to your collaboration value—most users find the small percentage well worth the quality matches!';
    }

    // Profile management
    if (lowerMessage.match(/\b(profile|edit profile|update profile|change profile|my account|complete profile|profile completion|improve profile)\b/)) {
      return 'Profile optimization tips: 🌟\n\n✅ Use professional photos\n✅ Write detailed bio (150+ words)\n✅ Add portfolio samples\n✅ List specific niches\n✅ Set accurate budget range\n✅ Complete all sections\n✅ Get verified\n\n**Why it matters:** Complete profiles get 10x more visibility and higher-quality matches. And remember, you only pay fees when you collaborate—so polish that profile and start connecting!';
    }

    // Portfolio
    if (lowerMessage.match(/portfolio|showcase|work samples|past work|examples|add portfolio|upload work|show my work/)) {
      return 'Build your portfolio: 📸\n\n1️⃣ Go to **Profile → Portfolio**\n2️⃣ Upload:\n   • Images\n   • Videos\n   • Links to content\n   • Case studies\n3️⃣ Add descriptions\n4️⃣ Organize by category\n\n**Why it pays off:** Strong portfolios get 4x more collaboration requests! And since you only pay fees on successful deals, every piece of work you showcase is an investment in future earnings.';
    }

    // Verification
    if (lowerMessage.match(/verify|verification|verified|get verified|verify account|verify profile|verification badge/)) {
      return 'Get verified: ✅\n\n**Verification benefits:**\n• Increased trust\n• Higher visibility\n• More matches\n• Priority support\n\n**How to verify:**\n1️⃣ Go to Profile Settings\n2️⃣ Click **Verify Account**\n3️⃣ Submit required documents\n4️⃣ Wait for approval (24-48 hours)\n\nVerified accounts get 5x more engagement! And verification is completely free—we only charge success fees on collaborations, never for profile features.';
    }

    // Messages & Communication
    if (lowerMessage.match(/\b(message|messages|inbox|chat|conversation|dm|direct message|message someone|how to message)\b/)) {
      return 'Access your messages: 💬\n\n1️⃣ Click **Messages** in the sidebar\n2️⃣ View all conversations\n3️⃣ Send messages to connections\n4️⃣ Get real-time notifications\n\n**Note:** You can only message people you\'re connected with. Send a connection request first!\n\n💡 Messaging is completely free—fees only apply when a collaboration is successfully completed.';
    }

    // Budget & Pricing (general, might overlap with fees—but we already have detailed fee response)
    if (lowerMessage.match(/\b(budget|price|pricing|cost|how much|rates|pricing tiers|subscription)\b/)) {
      // If they mention subscription, we already handled that pattern. This is fallback.
      return `Our platform uses a **two-sided commission model**:

• **Companies:** 5% success fee on completed collaborations
• **Influencers:** 10% success fee on completed collaborations

There are **no subscriptions or recurring fees**. You only pay when a collaboration successfully concludes.

**Example:** $1,000 deal → company pays $1,050 total, influencer receives $900 net.

Set your budget range in profile settings, and our AI will find compatible matches within your range!`;
    }

    // Payment Methods (covered above, but this pattern may still match)
    if (lowerMessage.match(/payment method|how to pay|payment options|credit card|paypal|bank transfer|payment processing/)) {
      return 'Accepted payment methods: 💳\n\n• Credit/Debit cards\n• PayPal\n• Bank transfer (ACH/wire)\n• Stripe\n\n**Process:**\n1. Agree on terms\n2. Company funds escrow (budget + 5% fee)\n3. Work completed & approved\n4. Influencer receives budget minus 10%\n\nAll transactions are secure and protected. Need help with a specific payment? Let me know!';
    }

    // Platform features
    if (lowerMessage.match(/\b(feature|features|what can|capabilities|functions|platform features|what does this do|available features)\b/)) {
      return `Platform features: 🚀

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

And our **two-sided commission model** ensures you only pay when you succeed. All features are free to use until you close a deal!`;
    }

    // Account & Settings
    if (lowerMessage.match(/\b(account|settings|preferences|configuration|setup|account settings|change settings|notification settings|privacy settings|security settings)\b/)) {
      return 'Manage your account: ⚙️\n\n1️⃣ Click your avatar → **Settings**\n2️⃣ Available options:\n   • Notification preferences\n   • Privacy settings\n   • Display preferences\n   • Email notifications\n   • Password & security\n   • Account information\n   • Payment methods\n   • Fee statements (view your transaction history)\n\nCustomize your experience to fit your needs!';
    }

    // Search functionality
    if (lowerMessage.match(/\b(search|find|look for|looking for|how to search|search bar|search feature|find profiles)\b/)) {
      return 'Use our powerful search: 🔍\n\n• Global search bar (top of page)\n• Filter by:\n  - Industry\n  - Location\n  - Budget range\n  - Rating\n  - Niche\n• Sort by compatibility score\n• Save search filters\n• View trending profiles\n\n**All free until you collaborate!** Try the search bar to find specific profiles instantly.';
    }

    // Notifications
    if (lowerMessage.match(/\b(notification|notifications|alert|alerts|updates|notification settings|turn off notifications|manage notifications)\b/)) {
      return 'Manage notifications: 🔔\n\n• Bell icon shows all notifications\n• Types:\n  - Message notifications\n  - Collaboration requests\n  - Profile views\n  - Match suggestions\n  - System updates (including fee-related updates)\n\nCustomize in **Settings → Notifications**. Choose email, push, or in-app notifications!';
    }

    // Success tips (enhanced with fee mention)
    if (lowerMessage.match(/\b(tips|advice|help me succeed|best practices|how to succeed|improve|get more matches|increase success|recommendations)\b/)) {
      return `Tips for success: 🌟

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

💡 **Remember:** You only pay fees when you succeed—so every match is a potential win with minimal risk. Profiles with 5+ reviews get 10x more matches!`;
    }

    // Industries & Niches
    if (lowerMessage.match(/\b(industry|industries|niche|niches|category|categories|sector|what industries|available industries)\b/)) {
      return 'Popular industries on our platform: 🎨\n\n• Fashion & Beauty\n• Fitness & Health\n• Food & Beverage\n• Travel & Lifestyle\n• Gaming & Tech\n• Music & Entertainment\n• Education\n• Home & Decor\n• Business & Finance\n• Sports & Outdoors\n• Parenting & Family\n• Art & Design\n\nSelect your industry in profile settings to get better matches! All industries have the same fee structure: 5% for companies, 10% for influencers on successful collaborations.';
    }

    // Connection status
    if (lowerMessage.match(/\b(connect|connection|connected|accept|pending|connection request|send connection|accept connection)\b/)) {
      return 'About connections: 🤝\n\n1️⃣ Send connection requests from profiles\n2️⃣ Accept/decline incoming requests\n3️⃣ View all connections in **Connections** page\n4️⃣ Message connected users\n5️⃣ Leave reviews after collaborations\n\nConnections are the first step to collaboration—and they\'re free! Fees only apply when a collaboration is successfully completed.\n\n💡 Tip: Personalize connection requests for better acceptance rates!';
    }

    // Campaign system
    if (lowerMessage.match(/\b(campaign|campaigns|project|projects|create campaign|view campaigns|campaign system|browse campaigns)\b/)) {
      return `Campaign system: 📋

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

Check **Campaigns** page to browse opportunities! All campaign browsing and applications are free—fees only apply to completed collaborations.`;
    }

    // Reviews & Ratings
    if (lowerMessage.match(/\b(review|reviews|rating|ratings|feedback|testimonial|leave review|rate|reputation)\b/)) {
      return 'Reviews & ratings: ⭐\n\n• Leave reviews after collaborations\n• Rate:\n  - Professionalism\n  - Communication\n  - Quality of work\n  - Timeliness\n• Reviews appear on profiles\n• Build your reputation\n• Get verified collaboration badges\n\nGood reviews lead to more opportunities—and more successful collaborations (which means more fees, but also more earnings!). Tip: Be honest and constructive in your feedback!';
    }

    // Response Time
    if (lowerMessage.match(/response time|how long|when will they respond|reply time|waiting for response|no response/)) {
      return 'About response times: ⏱️\n\n• Most users respond within 24-48 hours\n• Check their profile for average response time\n• Send a polite follow-up after 3 days\n• Some users have auto-responders\n\nTip: Users with faster response times are marked with a ⚡ badge!\n\n⏳ While waiting, you can explore other matches—browsing is always free.';
    }

    // Contract & Agreement
    if (lowerMessage.match(/contract|agreement|terms|legal|sign contract|collaboration agreement|terms of service/)) {
      return 'Contracts & agreements: 📄\n\n• Platform provides contract templates\n• Customize for your collaboration\n• Both parties must agree\n• Digital signatures supported\n• Stored securely in platform\n\nAlways use contracts for:\n• Payment terms\n• Deliverables\n• Timeline\n• Rights & usage\n• Fee acknowledgment (both parties confirm the success fees)\n\nProtect yourself and your partner! Our ToS are available in the footer.';
    }

    // Dispute Resolution
    if (lowerMessage.match(/dispute|problem with collaboration|disagreement|conflict|resolve dispute|mediation|complaint/)) {
      return 'Dispute resolution: ⚖️\n\nIf issues arise:\n1️⃣ Try to resolve directly first\n2️⃣ Document everything\n3️⃣ Contact platform support\n4️⃣ Mediation available\n5️⃣ Review contract terms\n\n**Fee implications:** If a collaboration is canceled or partially completed, fees may be adjusted or refunded. We\'re here to help both parties reach a fair resolution.\n\nContact: support@icmatch.com';
    }

    // Data Export
    if (lowerMessage.match(/export data|download data|export analytics|get my data|data export|download report/)) {
      return 'Export your data: 📥\n\n• Analytics → Export Report\n• Choose format: PDF, CSV, Excel\n• Select date range\n• Download instantly\n\nAvailable exports:\n• Performance reports\n• Collaboration history (including fees paid/earned)\n• Financial statements\n• Profile data\n\nGo to **Settings → Data Export**';
    }

    // Delete Account
    if (lowerMessage.match(/delete account|close account|remove account|deactivate|cancel account|delete profile/)) {
      return 'Account deletion: 🗑️\n\nBefore you go:\n• Export your data first\n• Complete pending collaborations\n• Withdraw remaining balance\n\nTo delete:\n1️⃣ Settings → Account\n2️⃣ **Delete Account**\n3️⃣ Confirm deletion\n4️⃣ Account removed in 30 days\n\nWe\'re sad to see you go! If you\'re leaving because of fees, remember you only pay when you succeed—no subscriptions. Can I help with anything?';
    }

    // Referral Program
    if (lowerMessage.match(/referral|refer friend|invite|referral program|earn rewards|invite users/)) {
      return 'Referral program: 🎁\n\n• Invite friends to join\n• Earn rewards for each signup\n• Get bonus for completed collaborations\n• Track referrals in Dashboard\n\n**How to refer:**\n1️⃣ Dashboard → Referrals\n2️⃣ Copy your unique link\n3️⃣ Share with friends\n4️⃣ Earn rewards!\n\nBoth you and your friend get bonuses! (Note: referral bonuses are separate from success fees.)';
    }

    // Mobile App
    if (lowerMessage.match(/mobile app|app|download app|ios|android|mobile version|phone app/)) {
      return 'Mobile experience: 📱\n\n• Fully responsive web app\n• Works on all devices\n• No download needed\n• Add to home screen for app-like experience\n\niOS: Safari → Share → Add to Home Screen\nAndroid: Chrome → Menu → Add to Home Screen\n\nNative apps coming soon! And just like on desktop, you only pay success fees on completed collaborations.';
    }

    // Language Support
    if (lowerMessage.match(/language|languages|translate|translation|other languages|change language|multilingual/)) {
      return 'Language support: 🌍\n\nCurrently available:\n• English (primary)\n\nComing soon:\n• Spanish\n• French\n• German\n• Portuguese\n• More languages\n\nChange language: **Settings → Language**\n\nNeed help in another language? Contact support! Our fee structure is the same worldwide: 5% companies, 10% influencers.';
    }

    // API Integration
    if (lowerMessage.match(/api|integration|developer|api access|integrate|api documentation|webhook/)) {
      return 'API & Integrations: 🔌\n\n• REST API available\n• Webhook support\n• OAuth authentication\n• Rate limiting applied\n\nDeveloper resources:\n• API documentation\n• Code examples\n• SDKs (coming soon)\n\n**Note:** Fees apply to collaborations initiated via API just like any other collaboration—5% companies, 10% influencers.\n\nContact: developers@icmatch.com for API access';
    }

    // Technical issues
    if (lowerMessage.match(/\b(error|bug|issue|problem|not working|broken|fix|technical issue|something wrong|doesn't work)\b/)) {
      return 'Having technical issues? 🔧\n\nQuick fixes:\n1️⃣ Refresh the page (F5)\n2️⃣ Clear browser cache\n3️⃣ Log out and log back in\n4️⃣ Check internet connection\n5️⃣ Try different browser\n6️⃣ Disable browser extensions\n\nStill having issues? Contact support at support@icmatch.com\n\nMost issues are resolved with a quick refresh! (And no, refreshing won\'t trigger any fees 😉)';
    }

    // Getting started
    if (lowerMessage.match(/\b(start|begin|getting started|new user|first time|onboard|how to start|new here|just joined)\b/)) {
      return `Welcome to IC Match! 🎉

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

Take the profile setup wizard for guided onboarding! Need help? I'm here to answer any questions!`;
    }

    // Safety & Security (enhanced with fee note)
    if (lowerMessage.match(/\b(safe|safety|secure|security|privacy|protect|scam|fraud|trust|verification|is this safe)\b/)) {
      return `Your safety matters: 🔒

✅ All data is encrypted
✅ Verified profiles available
✅ Secure payment processing (escrow)
✅ Report suspicious activity
✅ Privacy controls
✅ Email verification required
✅ Two-factor authentication
✅ Secure messaging

💰 **Financial safety:** Funds are held in escrow and only released upon approval. Platform fees (5% companies, 10% influencers) are transparent and shown before you commit.

⚠️ Never share personal payment info outside the platform! Report any suspicious behavior immediately.`;
    }

    // Help & Support
    if (lowerMessage.match(/\b(help|support|assist|contact|customer service|guide|tutorial|instructions)\b/)) {
      return 'I\'m here to help! I can assist you with:\n\n💰 **Fees & Payments** — 5% companies, 10% influencers on successful deals\n🎯 **Finding perfect matches**\n🤝 **Sending collaboration requests**\n📊 **Viewing your analytics**\n✏️ **Managing your profile**\n💬 **Using messaging features**\n⚙️ **Platform settings**\n\nWhat would you like to know more about?';
    }

    // ===== ADDITIONAL RESPONSES (NEW) =====

    // Data privacy / GDPR / CCPA
    if (lowerMessage.match(/\b(privacy|data privacy|gdpr|ccpa|personal data|data protection|your data|my data|data usage)\b/)) {
      return `Your privacy is important to us! 🔐

**How we handle your data:**
• We collect only necessary information for matching and collaborations
• Your data is encrypted and stored securely
• We never sell your personal information to third parties
• You can request a copy of your data or deletion anytime

**Privacy rights:**
- Access your data in Settings
- Export your data (GDPR/CCPA compliant)
- Delete your account and data

Read our full Privacy Policy in the footer or at /privacy. Questions? Contact privacy@icmatch.com.`;
    }

    // Two-factor authentication / 2FA
    if (lowerMessage.match(/\b(2fa|two factor|two-factor|multi factor|mfa|authenticator|security code|2 step verification)\b/)) {
      return `Yes, we support Two-Factor Authentication (2FA)! 🔐

**Enable 2FA for extra security:**
1️⃣ Go to **Settings → Security**
2️⃣ Click **Enable Two-Factor Authentication**
3️⃣ Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
4️⃣ Enter the verification code
5️⃣ Save your backup codes in a safe place

Once enabled, you'll need both your password and a code from your authenticator app to log in. Highly recommended!`;
    }

    // Account types / roles
    if (lowerMessage.match(/\b(account type|role|switch role|change role|influencer or company|both roles|multiple roles)\b/)) {
      return `**Account roles on our platform:**

👤 **Influencer:** Create content, collaborate with brands, build your portfolio
🏢 **Company:** Find influencers, create campaigns, promote your products

**Can you have both roles?** Currently, each account is tied to a single role. If you need both, you can create two separate accounts with different emails, or contact support for assistance.

**Switching roles?** If you registered as the wrong type, you can change it in **Settings → Account Information** (limited to once every 30 days).`;
    }

    // Exclusivity / non-compete
    if (lowerMessage.match(/\b(exclusive|exclusivity|non-compete|work with competitors|multiple brands|multiple influencers)\b/)) {
      return `**Exclusivity and non-compete** are handled between you and your collaboration partner.

🤝 **Platform policy:** We don't enforce exclusivity unless agreed in your contract. You're free to work with multiple brands or influencers simultaneously.

📝 **Contract terms:** If exclusivity is important, include it in your collaboration agreement (template available). Specify:
- Duration of exclusivity
- Scope (e.g., category, platform)
- Compensation

Always clarify expectations upfront!`;
    }

    // Rights and usage / intellectual property
    if (lowerMessage.match(/\b(rights|usage rights|intellectual property|ip|ownership|who owns|license|content rights)\b/)) {
      return `**Intellectual Property & Usage Rights** – a common question! 📝

By default, when a collaboration is completed and paid:
- **Influencer grants the company** a license to use the created content for the agreed purpose (e.g., social media, ads)
- **Influencer retains ownership** of their original work unless explicitly transferred

**You can customize rights in the collaboration agreement:**
• Exclusive vs non-exclusive
• Time-limited vs perpetual
• Geographic restrictions
• Additional usage fees

Always discuss and agree on rights before starting work! Need help? Use our contract templates.`;
    }

    // Time to find a match
    if (lowerMessage.match(/\b(how long does it take|time to find|average time|when will i find|match speed)\b/)) {
      return `⏱️ **How long does it take to find a match?**

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

Remember: you can browse and connect while you wait—it's all free!`;
    }

    // Can I message without connecting?
    if (lowerMessage.match(/message without connecting|dm without connection|contact directly|send message before connect/)) {
      return `🔒 **Messaging policy:** For privacy and spam prevention, you can only message users after you've connected with them.

**How to connect:**
1️⃣ Find a profile you're interested in
2️⃣ Click **Connect** (on their profile or matches page)
3️⃣ They'll receive a request; once accepted, you can message freely

**Why this rule?**
- Prevents unsolicited spam
- Ensures mutual interest
- Creates a safer environment

If you're trying to reach someone specific, send a connection request with a personalized note—it increases acceptance chances!`;
    }

    // Can I export chat history?
    if (lowerMessage.match(/export chat|download messages|save conversation|chat history export/)) {
      return `📥 **Exporting chat history:** Currently, you can view your full message history in the Messages page. For exporting:

**Individual conversation:**
- Open the conversation
- Click the menu (three dots) in the top right
- Select **Export Chat** (downloads as .txt or .pdf)

**All messages (bulk export):**
- Go to **Settings → Data Export**
- Choose **Messages** under data types
- Select date range and format
- Request export (you'll receive an email with download link)

Need help? Contact support!`;
    }

    // Block or report a user
    if (lowerMessage.match(/\b(block user|report user|unwanted|harassment|spam|inappropriate|flag user)\b/)) {
      return `**Blocking & Reporting Users** 🚫

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

Our moderation team reviews reports within 24 hours. Blocked users cannot message you or see your profile. Your safety is our priority!`;
    }

    // Can I change my username?
    if (lowerMessage.match(/change username|update username|display name|edit name/)) {
      return `**Changing your username/display name:** ✏️

**Display Name:** You can change this anytime in **Settings → Profile**. This is what others see.

**Username (handle):** For security and consistency, usernames cannot be changed after registration. If you absolutely need a different username, you'd need to create a new account (with a different email) or contact support for special cases.

**Tip:** Choose a professional username that reflects your brand—it's permanent!`;
    }

    // How to delete a campaign
    if (lowerMessage.match(/delete campaign|remove campaign|cancel campaign|stop campaign/)) {
      return `**Deleting or pausing a campaign:** 📋

**To delete a draft campaign:** Go to Campaigns → Drafts, click the trash icon.

**To cancel an active campaign:**
1️⃣ Open the campaign
2️⃣ Click **Edit Campaign**
3️⃣ Scroll to bottom and click **Cancel Campaign**
4️⃣ Confirm

⚠️ Note: If you've already accepted applications, you'll need to notify applicants. Canceling may affect your response rate metrics.

**To pause (temporarily hide):** You can set campaign status to "Paused" instead of deleting.`;
    }

    // How to withdraw money (for influencers)
    if (lowerMessage.match(/withdraw|withdrawal|get money|cash out|transfer to bank/)) {
      return `**Withdrawing your earnings** (for influencers): 💵

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

**Note:** Funds are held securely until you withdraw. Need help? Let me know!`;
    }

    // Tax information / 1099
    if (lowerMessage.match(/\b(tax|taxes|1099|w-9|vat|gst|invoice|receipt)\b/)) {
      return `**Tax Information** 🧾

**For Influencers:**
- You are responsible for reporting your earnings and paying applicable taxes
- At year-end, we provide a **1099 form** (for US users earning over $600) and **earnings summary**
- Download tax documents in **Settings → Tax Information**

**For Companies:**
- You can download invoices for all payments in **Billing → Invoices**
- The platform fee (5%) is included in your invoice

**VAT/GST:** If applicable, taxes are calculated based on your location and added at checkout.

Questions? Consult a tax professional—we can't give tax advice!`;
    }

    // Affiliate program details
    if (lowerMessage.match(/\b(affiliate|affiliate program|earn money by referring|referral commission)\b/)) {
      return `**Affiliate Program** – Earn by referring users! 🎁

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

Interested? Visit /affiliate or contact affiliates@icmatch.com!`;
    }

    // Platform uptime / status
    if (lowerMessage.match(/\b(down|site down|platform not working|status page|outage|maintenance)\b/)) {
      return `**Platform Status** 🟢

We strive for 99.9% uptime. If you're experiencing issues:

🔍 **Check our status page:** status.icmatch.com (real-time updates)
🛠️ **Scheduled maintenance:** Announced 24h in advance via email and banner
📢 **Incident reports:** Posted on status page within minutes

**Quick checks:**
- Try refreshing
- Clear cache
- Check internet connection
- See if others are reporting issues on social media

If problems persist, contact support@icmatch.com. We're on it!`;
    }

    // How to become a verified influencer
    if (lowerMessage.match(/\b(verified influencer|get verified|verification process|verified badge)\b/)) {
      return `**Becoming a Verified Influencer** ✅

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

Start building your reputation today!`;
    }

    // How to become a verified company
    if (lowerMessage.match(/\b(verified company|company verification|business verification)\b/)) {
      return `**Company Verification** – Establish trust! 🏢

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

Verification is free—just takes a bit of paperwork!`;
    }

    // Cancel collaboration request
    if (lowerMessage.match(/cancel collaboration request|withdraw request|unsend request/)) {
      return `**Canceling a Collaboration Request** ❌

If you sent a request and want to cancel:

**If the request is pending (not yet accepted):**
1️⃣ Go to **Connections → Sent Requests**
2️⃣ Find the request
3️⃣ Click **Cancel Request**
4️⃣ Confirm

**If already accepted:** You'll need to discuss with the other party—you can mutually cancel via the collaboration page (both parties must agree).

**Note:** Canceled requests don't affect your metrics, but frequent cancellations may impact your response rate.`;
    }

    // Default response with suggestions
    return `I'm not sure I understand that specific question. 🤔

I can help you with:
💰 **Fees & Payments** — our two-sided commission model (5% companies, 10% influencers on successful collaborations)
🎯 **Finding matches**
🤝 **Starting collaborations**
📊 **Viewing analytics**
✏️ **Managing your profile**
💬 **Messaging & notifications**
🎯 **Platform features**

What would you like to know more about?`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);

    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
    inputRef.current?.focus();
  };

  const quickActions = [
    'How do fees work?',
    'Find matches',
    'View analytics',
    'Send collaboration request',
    'Help',
  ];

  if (isMinimized) {
    return (
      <div className="chatbot-widget minimized">
        {/* Floating Action Button */}
        <button
          className="chatbot-fab"
          onClick={handleToggle}
          aria-label="Open AI Chatbot"
        >
          <RiRobot2Line />
        </button>
      </div>
    );
  }

  return (
    <div className={`chatbot-widget ${isOpen ? 'open' : ''}`} ref={containerRef}>
      <div className="chatbot-container">
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-left">
            <div className="chatbot-avatar">
              <RiRobot2Line />
            </div>
            <div className="chatbot-header-info">
              <h3>IC Match Assistant</h3>
              <p className={`chatbot-status ${isConnected ? 'connected' : 'connecting'}`}>
                {isConnected ? (
                  <>
                    <span className="chatbot-status-dot"></span>
                    Online
                  </>
                ) : (
                  <>
                    <span className="chatbot-status-dot connecting"></span>
                    Connecting...
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="chatbot-header-actions">
            <button
              className="chatbot-header-btn"
              onClick={handleMinimize}
              aria-label="Minimize"
            >
              <FiMinus />
            </button>
            <button
              className="chatbot-header-btn"
              onClick={handleMinimize}
              aria-label="Close"
            >
              <FiX />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chatbot-messages">
          {messages.length === 0 ? (
            <div className="chatbot-empty">
              <RiRobot2Line className="chatbot-empty-icon" />
              <h3>Hi! I'm your AI assistant</h3>
              <p>Ask me anything about our two-sided commission model, finding matches, collaborations, or platform features!</p>
              <p className="chatbot-empty-sub">💰 Companies pay 5% | Influencers pay 10% (only on successful deals)</p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`chatbot-message ${message.senderType}`}
                >
                  <div className="chatbot-message-avatar">
                    {message.senderType === 'bot' ? (
                      <RiRobot2Line />
                    ) : (
                      user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'
                    )}
                  </div>
                  <div className="chatbot-message-content">
                    <div className="chatbot-message-bubble">
                      {formatMessage(message.content)}
                    </div>
                    <div className="chatbot-message-time">
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="chatbot-message bot">
                  <div className="chatbot-message-avatar">
                    <RiRobot2Line />
                  </div>
                  <div className="chatbot-typing">
                    <div className="chatbot-typing-dots">
                      <div className="chatbot-typing-dot" />
                      <div className="chatbot-typing-dot" />
                      <div className="chatbot-typing-dot" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Quick Actions */}
        {messages.length === 0 && (
          <div className="chatbot-quick-actions">
            {quickActions.map((action) => (
              <button
                key={action}
                className="chatbot-quick-action"
                onClick={() => handleQuickAction(action)}
              >
                {action}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="chatbot-input-container">
          {!isConnected && messages.length === 0 && (
            <div className="chatbot-connection-warning">
              <span>💡 Chatbot is ready! Type your message below.</span>
            </div>
          )}
          <div className="chatbot-input-wrapper">
            <textarea
              ref={inputRef}
              className="chatbot-input"
              placeholder="Type your message..."
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              rows={1}
              disabled={false}
            />
            <button
              className="chatbot-send-btn"
              onClick={handleSend}
              disabled={!inputValue.trim()}
              aria-label="Send message"
              title="Send message"
            >
              <FiSend />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
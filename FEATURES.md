# 🎉 ExpenWall - New Features Documentation

## 🍔 Cravings Tracker

### Overview
The Cravings Tracker helps you resist unhealthy spending by logging food and shopping cravings, tracking whether you gave in or resisted, and showing you how much money you've saved!

### Key Features

#### 📊 Analytics Dashboard
- **Total Money Saved**: See how much you've saved by resisting cravings
- **Total Money Wasted**: Track money spent on impulse purchases
- **Resistance Rate**: Your success percentage (Resisted / Total Cravings)
- **Most Craved Items**: Ranking of your top craved items with total amounts

#### 🎯 How It Works

1. **Log a Craving**
   - When you're about to order unhealthy food (Zepto, Swiggy, Zomato, etc.)
   - Take a screenshot of your cart (AI extraction coming soon)
   - Or manually add items with name, price, quantity
   - Select the platform (Zepto, Swiggy, Zomato, Blinkit, etc.)
   - Add optional notes about why you're craving

2. **Mark Outcome**
   - **"I Resisted!"** - You successfully avoided the purchase
     - 🎊 Beautiful 3D celebration animation with confetti
     - Motivational message ("Amazing! You saved ₹XXX!")
     - Money added to your "Saved" total
   
   - **"I Gave In"** - You made the purchase
     - 😔 Shake animation
     - Reminder message ("₹XXX wasted. Try harder next time!")
     - Money added to your "Wasted" total

3. **Track Progress**
   - View date-wise history of all cravings
   - See platform breakdown
   - Monitor resistance trends
   - Identify patterns in your cravings

#### 🎨 Animations

**Success (Resisted):**
- 50 confetti particles falling
- Bouncing checkmark icon
- Green gradient celebration card
- Random motivational messages
- Shows money saved prominently

**Failure (Gave In):**
- Red shake animation
- Sad icon animation
- Reminder to do better
- Shows money wasted

#### 📱 Use Cases

**Example 1: Late Night Food Order**
```
1. You're craving biryani at 11 PM
2. Add to Swiggy cart (₹450)
3. Take screenshot and upload to Cravings
4. Tomorrow morning, mark as "Resisted"
5. See celebration: "You saved ₹450! Keep it up!"
```

**Example 2: Unhealthy Snacks**
```
1. Browsing Zepto for chips and chocolates
2. Cart total: ₹320
3. Log craving with items manually
4. Close Zepto and wait
5. Next day, mark as "Resisted"
6. Resistance rate increases!
```

---

## 🛒 Enhanced Buying List

### Overview
A smart, organized system to plan purchases with dynamic product fields, folders, reminders, and multi-platform comparison.

### Key Features

#### 🎯 Smart Product Detection

When you type a product name, the system automatically:
- Detects the product category (Soap, Electronics, Groceries, etc.)
- Shows **only relevant fields** for that product type
- Suggests common brands and options

**Supported Product Categories:**

1. **Soaps** (Dove, Lux, Lifebuoy, etc.)
   - Brand, Variant (White/Pink/Moisturizing)
   - Weight (75g, 125g, 150g)
   - Quantity, MRP, Price

2. **Shampoo & Hair Care**
   - Brand, Variant
   - Volume (200ml, 340ml, 650ml)
   - MRP, Price

3. **Immersion Rod / Water Heater**
   - Brand (Bajaj, Usha, Crompton)
   - Power (1000W, 1500W, 2000W)
   - Platform, Price, Warranty

4. **Tube Lights / LED Bulbs**
   - Brand (Philips, Bajaj, Syska)
   - Power (9W, 12W, 18W, 20W)
   - Type (LED, CFL, Tube Light)
   - Color (Cool White, Warm White)
   - Quantity, Price

5. **Shoes**
   - Brand (Nike, Adidas, Puma, Bata)
   - Type (Running, Sneakers, Formal, Sandals)
   - Size (UK), Color
   - Platform, Price

6. **Rice**
   - Brand (India Gate, Daawat)
   - Type (Basmati, Sona Masoori)
   - Weight (5kg, 10kg, 25kg)
   - Price

7. **Cooking Oil**
   - Brand (Fortune, Saffola)
   - Type (Sunflower, Mustard, Groundnut)
   - Volume (1L, 2L, 5L)
   - Price

8. **Atta (Flour)**
   - Brand (Aashirvaad, Pillsbury)
   - Type (Whole Wheat, Multigrain)
   - Weight (5kg, 10kg)
   - Price

9. **Induction Cooktop**
   - Brand (Prestige, Philips, Bajaj)
   - Power (1200W, 1800W, 2000W)
   - Features (Auto-off, Timer)
   - Platform, Price, Warranty

10. **Pressure Cooker**
    - Brand (Prestige, Hawkins)
    - Capacity (2L, 3L, 5L, 7L)
    - Type (Aluminium, Stainless Steel)
    - Price

11. **Air Cooler**
    - Brand (Symphony, Bajaj, Crompton)
    - Capacity (Water tank in Liters)
    - Type (Desert, Personal, Tower)
    - Platform, Price

12. **Snacks (for Cravings)**
    - Brand (Lays, Kurkure, Bingo)
    - Flavor
    - Weight (20g, 50g, 90g, 150g)
    - Quantity, Price

13. **Biryani (for Cravings)**
    - Restaurant name
    - Type (Chicken, Mutton, Veg, Egg)
    - Quantity (Half, Full, Mini, Family Pack)
    - Platform (Swiggy, Zomato, Zepto)
    - Price

#### 📁 Folder Organization

**Create Custom Folders:**
- "Rental Home Setup" - All items needed for new home
- "Electronics" - Gadgets and appliances
- "Groceries" - Monthly staples
- "Gifts" - Items to buy for others
- Any custom category you want!

**Features:**
- Filter view by folder
- See item count per folder
- Visual folder grouping
- Easy navigation

#### ⏰ Multiple Reminders

Set as many reminders as you want for each item:

**Reminder Types:**
1. **Days Before** - "Remind me 2 days before target date"
2. **Hours Before** - "Remind me 24 hours before"
3. **On Date** - "Remind me on the target date"

**Example: Big Billion Days Sale**
```
Product: Immersion Rod
Target Date: February 10, 2026
Reminders:
- 5 days before (Feb 5)
- 2 days before (Feb 8)
- 1 day before (Feb 9)
- On date (Feb 10)
```

#### 🏪 Multi-Platform Comparison

**Add Same Product from Different Platforms:**
```
Product: Bajaj Immersion Rod 1500W

Item 1:
- Platform: Amazon
- Price: ₹450
- Brand: Bajaj
- Power: 1500W

Item 2:
- Platform: Flipkart
- Price: ₹420
- Brand: Bajaj
- Power: 1500W

Item 3:
- Platform: Local Shop
- Price: ₹400
- Brand: Bajaj
- Power: 1500W

→ Easy comparison in your buying list!
→ Delete alternatives after purchase
```

#### ✅ Purchase Tracking

- Click checkbox to mark item as bought
- Item gets strike-through styling
- Filters to show pending vs bought
- Delete item after purchase confirmation

#### 🔍 Expandable Details

Click "Show Details" on any item to see:
- All product specifications
- Platform information
- Reminders set
- Target date
- Notes

---

## 🎯 Real-World Use Cases

### Use Case 1: Moving to New Rental Home

**Folder: "Rental Home Setup"**

Items to add:
1. Air Cooler (Symphony 50L Desert Cooler)
   - Platform: Amazon
   - Price: ₹8,500
   - Target: Before summer (April 1)
   - Reminders: 7 days, 3 days, 1 day before

2. Immersion Rod (Bajaj 1500W)
   - Compare prices:
     - Amazon: ₹450
     - Flipkart: ₹420
     - Local: ₹400
   - Decision: Buy from Local Shop

3. Induction Cooktop (Prestige 2000W)
   - Platform: Flipkart
   - Price: ₹2,800
   - Features: Timer, Auto-off

4. Pressure Cooker (Hawkins 5L)
   - Platform: Amazon
   - Price: ₹1,200

5. LED Bulbs (Philips 12W x 6)
   - Platform: Local Shop
   - Price: ₹180 per bulb
   - Total: ₹1,080

**Total Budget: ₹13,970**

### Use Case 2: Monthly Groceries Shopping

**Folder: "Monthly Groceries"**

1. Rice (India Gate Basmati 10kg)
   - Price: ₹850

2. Cooking Oil (Fortune Sunflower 5L)
   - Price: ₹650

3. Atta (Aashirvaad Whole Wheat 10kg)
   - Price: ₹420

4. Dove Soap (125g x 6 bars)
   - Variant: Moisturizing
   - Price: ₹360

5. Pantene Shampoo (650ml)
   - Variant: Silky Smooth
   - Price: ₹280

**Total: ₹2,560**

### Use Case 3: Resisting Unhealthy Cravings

**Week 1 of February 2026:**

**Monday Night:**
- Craving: Biryani from Swiggy (₹450)
- Action: Logged in Cravings
- Outcome: Resisted ✅
- Saved: ₹450

**Wednesday:**
- Craving: Zepto snacks (Chips, Cookies, Chocolates - ₹320)
- Action: Logged in Cravings
- Outcome: Gave In ❌
- Wasted: ₹320

**Friday:**
- Craving: Zomato burger + fries (₹280)
- Action: Logged in Cravings
- Outcome: Resisted ✅
- Saved: ₹280

**Sunday:**
- Craving: Swiggy ice cream + desserts (₹350)
- Action: Logged in Cravings
- Outcome: Resisted ✅
- Saved: ₹350

**Week Stats:**
- Total Cravings: 4
- Resisted: 3 (75% resistance rate! 🎉)
- Saved: ₹1,080
- Wasted: ₹320
- Net Savings: ₹760

---

## 🚀 Future Enhancements (Coming Soon)

### AI Image Extraction
- Upload screenshot of Amazon/Flipkart product
- AI automatically extracts:
  - Product name
  - Brand
  - Price
  - Specifications
  - Platform
- Auto-fills all relevant fields

### Craving Screenshot Analysis
- Upload Zepto/Swiggy cart screenshot
- AI extracts all items, quantities, prices
- One-click craving logging

### Price Tracking
- Monitor price changes over time
- Get alerts when price drops
- Historical price charts

### Reminder Notifications
- Browser/mobile notifications
- Email reminders
- WhatsApp integration (future)

### Smart Suggestions
- "You craved biryani 5 times this month" → Suggest cooking at home
- "Air cooler prices usually drop in October" → Best time to buy alert
- Compare your cravings resistance with friends (gamification)

---

## 💡 Tips for Maximum Benefit

### For Cravings:
1. **Log BEFORE ordering** - This creates a pause to reconsider
2. **Check morning after** - Better decision-making when not hungry
3. **Review weekly stats** - See patterns and improve
4. **Celebrate wins** - Each resistance is progress!
5. **Don't be harsh on yourself** - 60%+ resistance rate is great!

### For Buying List:
1. **Always compare platforms** - Add same item 2-3 times from different sources
2. **Use folders religiously** - Makes big purchases manageable
3. **Set multiple reminders for sales** - Don't miss Big Billion Days!
4. **Add detailed notes** - "Friend recommended", "Saw in shop", etc.
5. **Update prices regularly** - Prices change, keep them current

---

## 📊 Technical Details

### Data Structure

**Craving:**
```typescript
interface Craving {
  id: string;
  items: { name: string; price: number; quantity: number }[];
  totalAmount: number;
  platform?: string;
  outcome: 'pending' | 'resisted' | 'gave_in';
  imageUrl?: string;
  notes?: string;
  cravedAt: string;
  resolvedAt?: string;
}
```

**BuyingItem:**
```typescript
interface BuyingItem {
  id: string;
  name: string;
  brand?: string;
  estimatedPrice: number;
  folder?: string;
  platform?: string;
  targetDate?: string;
  reminders?: BuyingItemReminder[];
  productDetails?: Record<string, any>;
  imageUrl?: string;
  notes?: string;
  isBought: boolean;
}
```

### Firestore Collections
- `cravings` - All user cravings
- `buyingList` - All buying list items

### Real-time Sync
- All data syncs in real-time across devices
- Cloud Firestore for reliability
- Offline support (future)

---

## 🎨 UI/UX Highlights

- **Gradient Headers** - Beautiful purple-pink gradients
- **3D Animations** - Smooth, delightful interactions
- **Dark Mode Support** - Full dark theme compatibility
- **Responsive Design** - Works on mobile, tablet, desktop
- **Intuitive Icons** - Clear visual indicators
- **Smart Forms** - Context-aware field display
- **Smooth Transitions** - Polished feel throughout

---

## 📝 Changelog

### Version 2.0 (February 2026)

**New Features:**
- ✅ Cravings Tracker with animations
- ✅ Enhanced Buying List with folders
- ✅ Smart product field detection (11+ categories)
- ✅ Multiple reminders per item
- ✅ Multi-platform comparison
- ✅ Beautiful celebration animations
- ✅ Comprehensive analytics

**Improvements:**
- ✅ Better navigation with Cookie icon for Cravings
- ✅ Improved type system
- ✅ Enhanced Firestore integration
- ✅ Folder-based organization

**Coming Next:**
- 🔜 AI screenshot extraction
- 🔜 Price tracking & alerts
- 🔜 Notification system
- 🔜 WhatsApp integration

---

## 🙏 Feedback & Support

We're constantly improving! Share your:
- Feature requests
- Bug reports
- Success stories ("I saved ₹5000 by resisting cravings!")
- Suggestions for new product categories

Happy tracking! 🎉💰
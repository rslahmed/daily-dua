# Daily Dua (দৈনিক দোয়া) 🌙

একটি আধুনিক, মিনিমালিস্ট ও অফলাইন ইসলামিক দোয়া অ্যাপ যা তৈরি করা হয়েছে **Expo SDK 58** ও **React Native** দিয়ে। কোনো ইউজার লগইন ছাড়াই সকাল, সন্ধ্যা ও ফরজ নামাজের পরের সহীহ মাসনূন দোয়াগুলো সহজে পাঠ ও প্রতিদিনের আমল ট্র্যাক করার জন্য এটি তৈরি।

---

## 🌟 প্রধান বৈশিষ্ট্যসমূহ (Key Features)

1. **৩টি প্রধান বিভাগ**:
   - 🌅 **সকালের দোয়া** (ফজর হতে সূর্যোদয় পর্যন্ত)
   - 🌇 **সন্ধ্যার দোয়া** (আসর হতে সূর্যাস্ত/মাগরিব পর্যন্ত)
   - 🕌 **নামাজের পরের দোয়া** (প্রতি ফরজ সালাত আদায়ের পর)

2. **বইয়ের মতো ৫টি স্বতন্ত্র অংশ (5-Part Dua Layout)**:
   - 📖 **আরবি (Arabic)**: মূল কুরআন ও হাদিসের আরবি পাঠ (কাস্টম **Hafs** ফন্টে সুনির্দিষ্ট হরকত ও তাশকিলসহ)।
   - 🗣️ **উচ্চারণ (Uccharon)**: স্পষ্ট বাংলা উচ্চারণ।
   - 📜 **অর্থ (Ortho)**: প্রাঞ্জল বাংলা অনুবাদ।
   - 🌟 **ফযীলত (Fazilat)**: হাদিসভিত্তিক ফজিলত ও সওয়াবের বিবরণ।
   - 📚 **রেফারেন্স (Reference)**: সহীহ হাদিস ও কিতাবের রেফারেন্স (বুখারী, মুসলিম, তিরমিযী, আবু দাউদ, ইত্যাদি)।

3. **পাঠের সংখ্যা ব্যাজ (Repetition Count Badge)**:
   - প্রতিটি দোয়ার কার্ডে কতবার পাঠ করতে হবে তা সুন্দর এমারেল্ড ব্যাজে চিহ্নিত (যেমন: ৩ বার, ৩৩ বার, ১ বার)।
   - ইন্টারেক্টিভ কাউন্টার: ব্যাজে ট্যাপ করে `১/৩`, `২/৩`, `৩/৩` গণনা করা যায় এবং নির্দিষ্ট সংখ্যা পূর্ণ হলে স্বয়ংক্রিয়ভাবে পড়া সম্পন্ন হয়।

4. **পড়া সম্পন্ন করার ট্র্যাকিং (Mark as Read) ও দৈনিক স্বয়ংক্রিয় রিসেট**:
   - প্রতিটি দোয়া পড়ার পর "পড়া হয়েছে" বাটনে ক্লিক করে চিহ্নিত করা যায়।
   - **প্রতি মধ্যরাতে স্বয়ংক্রিয় রিসেট**: `AsyncStorage`-এ তারিখ (`YYYY-MM-DD`) সংরক্ষিত থাকে। নতুন দিন শুরু হলে পড়াগুলো আবার নতুন দিনের জন্য স্বয়ংক্রিয়ভাবে রিসেট হয়ে যায়।

5. **অ্যাপ সেটিংস (Display Customization)**:
   - হেডার সেটিংস বাটন থেকে তাৎক্ষণিকভাবে:
     - উচ্চারণ প্রদর্শন / লুকান (Show/Hide Uccharon)
     - অর্থ প্রদর্শন / লুকান (Show/Hide Ortho)
     - ফযীলত প্রদর্শন / লুকান (Show/Hide Fazilat)
     - আরবি ফন্ট সাইজ পরিবর্তন (ছোট, সাধারণ, বড়, খুব বড়) লাইভ প্রিভিউসহ
     - আজকের আমলের অগ্রগতি এক ক্লিকে রিসেট

6. **উন্নত টাইপোগ্রাফি ও ডার্ক মোড**:
   - আরবি: **Hafs** কুরআন ফন্ট (`hafs.ttf`)
   - বাংলা: **Hind Siliguri** (`@expo-google-fonts/hind-siliguri`)
   - প্রিমিয়াম ডার্ক মোড (`#0A0F0D`) ও ইসলামিক এমারেল্ড গ্রিন অ্যাকসেন্ট (`#10B981`)

---

## 🚀 কীভাবে চালাবেন (How to Run)

প্রজেক্ট ডিরেক্টরিতে যান:
```bash
cd /Users/raselahmed/code/daily-dua
```

Expo ডেভেলপমেন্ট সার্ভার চালু করুন:
```bash
npm start
```

- **iOS সিমুলেটর**: কীবোর্ডে `i` চাপুন অথবা `npm run ios`
- **Android এমুলেটর**: কীবোর্ডে `a` চাপুন অথবা `npm run android`
- **Expo Go (Real Phone)**: টার্মিনালে আসা QR কোডটি আপনার ফোনের Expo Go অ্যাপ দিয়ে স্ক্যান করুন
- **Web**: `npx expo start --web`

---

## 📂 প্রোজেক্ট স্ট্রাকচার (Project Structure)

```
daily-dua/
├── assets/
│   ├── fonts/
│   │   ├── hafs.ttf            # Arabic Quran font (converted from hafs.woff2)
│   │   └── hafs.woff2
│   ├── icon.png                # Emerald green background with white dua prayer hands
│   └── splash-icon.png
├── src/
│   ├── components/
│   │   ├── Header.tsx          # Top bar with branding & Bengali date
│   │   ├── OverallProgressCard.tsx # Daily progress stats
│   │   ├── CategoryCard.tsx    # 3 main category cards
│   │   ├── DuaCard.tsx         # 5-part Dua card with repetition badge
│   │   ├── ProgressBar.tsx     # Smooth progress indicator
│   │   └── SettingsModal.tsx   # Customization & font size settings
│   ├── context/
│   │   ├── DuaProgressContext.tsx # Daily reset logic & mark-as-read state
│   │   └── SettingsContext.tsx    # Display preferences state
│   ├── data/
│   │   ├── categories.json     # Definition of the 3 dua categories
│   │   └── duas.json           # Authentic Sahih duas dataset
│   ├── types/
│   │   └── dua.ts              # TypeScript interfaces
│   └── utils/
│       └── date.ts             # Bengali date formatter & YYYY-MM-DD helper
├── App.tsx                     # Main application entry
├── app.json                    # Expo configuration
└── package.json
```

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OverallProgressCard } from '../components/OverallProgressCard';
import { CategoryCard } from '../components/CategoryCard';
import { useDua } from '../context/DuaContext';

interface HomePageProps {
  onSelectCategory?: (categoryId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectCategory }) => {
  const { categories, isLoading } = useDua();
  const navigate = useNavigate();

  const handleSelect = (categoryId: string) => {
    if (onSelectCategory) {
      onSelectCategory(categoryId);
    } else {
      navigate(`/category/${categoryId}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Daily Overall Progress Summary */}
      <OverallProgressCard />

      {/* Categories Section */}
      <div>
        <div className="mb-3 px-1">
          <h2 className="text-lg md:text-xl font-bold text-white">দোয়ার বিভাগসমূহ</h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">যেকোনো বিভাগে ক্লিক করে দোয়া পড়ুন ও আমল সম্পন্ন করুন</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                onSelect={handleSelect}
              />
            ))}
          </div>
        )}
      </div>

      {/* Islamic Quote Card */}
      <div className="bg-[#0D1613] border border-[#192C25] rounded-2xl p-5 md:p-6 text-center space-y-2.5">
        <p className="font-arabic text-lg md:text-xl text-[#34D399] leading-relaxed">
          أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ
        </p>
        <p className="text-xs md:text-sm text-[#CBD5E1] font-medium max-w-lg mx-auto leading-relaxed">
          "জেনে রেখো, একমাত্র আল্লাহর স্মরণেই অন্তরসমূহ প্রশান্তি লাভ করে।"
        </p>
        <p className="text-[11px] text-[#6EE7B7]">
          — সূরা আর-রা'দ, আয়াত: ২৮
        </p>
      </div>
    </div>
  );
};

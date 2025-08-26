from django.core.management.base import BaseCommand
from prompts.models import Category, Tag, Prompt

class Command(BaseCommand):
    help = 'Load sample data for prompt library'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Loading sample data...'))
        
        # Create Categories
        categories_data = [
            {
                'name': 'Làm Video - Hiệu AI', 
                'description': 'Tạo video với AI, hiệu ứng và content sáng tạo',
                'icon_emoji': '🎬',
                'color': '#EF4444',
                'order': 1,
                'is_featured': True
            },
            {
                'name': 'Văn hành', 
                'description': 'Quản lý và vận hành doanh nghiệp hiệu quả',
                'icon_emoji': '⚙️',
                'color': '#3B82F6',
                'order': 2,
                'is_featured': True
            },
            {
                'name': 'Nhân sự', 
                'description': 'Quản lý nhân sự và phát triển đội ngũ',
                'icon_emoji': '👥',
                'color': '#10B981',
                'order': 3,
                'is_featured': True
            },
            {
                'name': 'Dược Phẩm', 
                'description': 'Thông tin và tư vấn về dược phẩm',
                'icon_emoji': '💊',
                'color': '#8B5CF6',
                'order': 4,
                'is_featured': True
            },
            {
                'name': 'Phong Thủy', 
                'description': 'Tư vấn phong thủy và phong tục',
                'icon_emoji': '🔮',
                'color': '#F59E0B',
                'order': 5,
                'is_featured': True
            },
            {
                'name': 'Sales', 
                'description': 'Bán hàng và chăm sóc khách hàng',
                'icon_emoji': '💰',
                'color': '#EC4899',
                'order': 6,
                'is_featured': True
            },
            {
                'name': 'Giáo Dục', 
                'description': 'Hỗ trợ giảng dạy và học tập',
                'icon_emoji': '📚',
                'color': '#06B6D4',
                'order': 7,
                'is_featured': True
            },
            {
                'name': 'Marketing', 
                'description': 'Chiến lược marketing và quảng cáo',
                'icon_emoji': '📢',
                'color': '#F97316',
                'order': 8,
                'is_featured': True
            },
            {
                'name': 'Khởi Nghiệp', 
                'description': 'Hỗ trợ khởi nghiệp và phát triển business',
                'icon_emoji': '🚀',
                'color': '#84CC16',
                'order': 9,
                'is_featured': True
            },
        ]
        
        categories = {}
        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults={
                    'description': cat_data['description'],
                    'icon_emoji': cat_data['icon_emoji'],
                    'color': cat_data['color'],
                    'order': cat_data['order'],
                    'is_featured': cat_data['is_featured'],
                }
            )
            categories[cat_data['name']] = category
            if created:
                self.stdout.write(f'Created category: {category.name}')

        # Create Tags
        tags_data = [
            {'name': 'viết lách', 'color': '#10B981'},
            {'name': 'sáng tạo', 'color': '#8B5CF6'},
            {'name': 'truyện', 'color': '#F59E0B'},
            {'name': 'tiếng anh', 'color': '#3B82F6'},
            {'name': 'học tập', 'color': '#EF4444'},
            {'name': 'giao tiếp', 'color': '#06B6D4'},
            {'name': 'python', 'color': '#10B981'},
            {'name': 'lập trình', 'color': '#8B5CF6'},
            {'name': 'code', 'color': '#F59E0B'},
            {'name': 'marketing', 'color': '#3B82F6'},
            {'name': 'content', 'color': '#EF4444'},
            {'name': 'social media', 'color': '#06B6D4'},
            {'name': 'data', 'color': '#10B981'},
            {'name': 'phân tích', 'color': '#8B5CF6'},
            {'name': 'biểu đồ', 'color': '#F59E0B'},
            {'name': 'ui', 'color': '#3B82F6'},
            {'name': 'ux', 'color': '#EF4444'},
            {'name': 'thiết kế', 'color': '#06B6D4'},
        ]
        
        tags = {}
        for tag_data in tags_data:
            tag, created = Tag.objects.get_or_create(
                name=tag_data['name'],
                defaults={'color': tag_data['color']}
            )
            tags[tag_data['name']] = tag
            if created:
                self.stdout.write(f'Created tag: {tag.name}')

        # Create Prompts
        prompts_data = [
            {
                'title': 'Prompt viết truyện ngắn',
                'description': 'Giúp bạn tạo ra truyện ngắn sáng tạo với cốt truyện hấp dẫn.',
                'prompt_text': '''Hãy viết một truyện ngắn với các yêu cầu sau:
- Độ dài: 500-800 từ
- Thể loại: [Thể loại bạn muốn]
- Nhân vật chính: [Mô tả nhân vật]
- Bối cảnh: [Thời gian và địa điểm]
- Xung đột: [Vấn đề cần giải quyết]

Hãy tạo ra một câu chuyện có cấu trúc rõ ràng với mở đầu hấp dẫn, phần giữa căng thẳng và kết thúc ấn tượng.''',
                'category': 'Làm Video - Hiệu AI',
                'difficulty': 'easy',
                'tags': ['viết lách', 'sáng tạo', 'truyện']
            },
            {
                'title': 'Prompt học tiếng Anh',
                'description': 'Hỗ trợ luyện tập tiếng Anh với AI một cách hiệu quả.',
                'prompt_text': '''Tôi muốn luyện tập tiếng Anh. Hãy giúp tôi:

1. Tạo ra 5 câu hội thoại thực tế về chủ đề: [Chủ đề]
2. Giải thích các cấu trúc ngữ pháp được sử dụng
3. Đưa ra 10 từ vựng quan trọng kèm ví dụ
4. Tạo bài tập thực hành với đáp án

Mức độ: [Beginner/Intermediate/Advanced]
Tình huống: [Mô tả tình huống cụ thể]''',
                'category': 'Giáo Dục',
                'difficulty': 'medium',
                'tags': ['tiếng anh', 'học tập', 'giao tiếp']
            },
            {
                'title': 'Prompt lập trình Python',
                'description': 'Sinh mã Python theo yêu cầu với giải thích chi tiết.',
                'prompt_text': '''Hãy viết code Python để:

Yêu cầu: [Mô tả chức năng cần thực hiện]
Input: [Định dạng dữ liệu đầu vào]
Output: [Kết quả mong muốn]

Yêu cầu thêm:
- Viết code sạch, có comment
- Xử lý exception
- Optimize performance
- Viết unit test
- Giải thích logic từng bước

Ví dụ sử dụng:
[Đưa ra ví dụ cụ thể]''',
                'category': 'Khởi Nghiệp',
                'difficulty': 'hard',
                'tags': ['python', 'lập trình', 'code']
            },
            {
                'title': 'Prompt Marketing Content',
                'description': 'Tạo nội dung marketing hiệu quả cho social media.',
                'prompt_text': '''Tạo campaign marketing cho:

Sản phẩm/Dịch vụ: [Tên và mô tả]
Target Audience: [Đối tượng khách hàng]
Platform: [Facebook/Instagram/LinkedIn/TikTok]
Mục tiêu: [Awareness/Engagement/Conversion]

Hãy tạo:
1. 5 post content với hashtag
2. 3 story template
3. 1 video script (60 giây)
4. Email marketing template
5. Call-to-action suggestions

Tone: [Professional/Friendly/Humorous]
Budget: [High/Medium/Low]''',
                'category': 'Marketing',
                'difficulty': 'medium',
                'tags': ['marketing', 'content', 'social media']
            },
            {
                'title': 'Prompt Phân tích dữ liệu',
                'description': 'Hướng dẫn phân tích và trực quan hóa dữ liệu.',
                'prompt_text': '''Phân tích dataset sau:

Dữ liệu: [Mô tả dataset]
Mục tiêu: [Câu hỏi cần trả lời]
Tools: [Python/R/Excel/Tableau]

Thực hiện:
1. Exploratory Data Analysis (EDA)
2. Data cleaning và preprocessing
3. Statistical analysis
4. Tạo visualizations
5. Insights và recommendations
6. Predictive modeling (nếu cần)

Hãy viết code step-by-step với:
- Data validation
- Missing value handling
- Outlier detection
- Feature engineering
- Model evaluation metrics''',
                'category': 'Dược Phẩm',
                'difficulty': 'hard',
                'tags': ['data', 'phân tích', 'biểu đồ']
            },
            {
                'title': 'Prompt Thiết kế UI/UX',
                'description': 'Tạo ý tưởng và wireframe cho giao diện người dùng.',
                'prompt_text': '''Thiết kế UI/UX cho:

App/Website: [Tên và mục đích]
Target Users: [Đối tượng sử dụng]
Platform: [Web/Mobile/Desktop]
Key Features: [Chức năng chính]

Deliverables:
1. User persona (2-3 personas)
2. User journey map
3. Information architecture
4. Wireframes (5-7 screens)
5. UI Style guide
6. Prototype description
7. Accessibility considerations

Design Principles:
- User-centered design
- Minimalist approach
- Consistent visual hierarchy
- Mobile-first responsive design

Tools: [Figma/Sketch/Adobe XD]''',
                'category': 'Văn hành',
                'difficulty': 'medium',
                'tags': ['ui', 'ux', 'thiết kế']
            }
        ]

        for prompt_data in prompts_data:
            prompt, created = Prompt.objects.get_or_create(
                title=prompt_data['title'],
                defaults={
                    'description': prompt_data['description'],
                    'prompt_text': prompt_data['prompt_text'],
                    'category': categories[prompt_data['category']],
                    'difficulty': prompt_data['difficulty'],
                    'views_count': __import__('random').randint(10, 500),
                    'likes_count': __import__('random').randint(1, 50),
                }
            )
            
            if created:
                # Add tags
                for tag_name in prompt_data['tags']:
                    if tag_name in tags:
                        prompt.tags.add(tags[tag_name])
                
                self.stdout.write(f'Created prompt: {prompt.title}')

        self.stdout.write(self.style.SUCCESS('Sample data loaded successfully!'))
        self.stdout.write(f'Created {Category.objects.count()} categories')
        self.stdout.write(f'Created {Tag.objects.count()} tags')
        self.stdout.write(f'Created {Prompt.objects.count()} prompts')

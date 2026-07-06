import { Container } from 'react-bootstrap';
import BookSection from '../components/book/BookSection';

export default function BookPage() {
    return (
        <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingTop: '76px' }}>
            <BookSection />
        </div>
    );
}

import React from 'react';
import { Card, Table, Badge } from 'react-bootstrap';
import NurseLayout from './components/layout/NurseLayout';
import './Dashboard.css';

const CalendarContent = () => {
    return (
        <>
            <div className="mb-4">
                <h2 className="fw-bold text-dark mb-1">Schedule Operations</h2>
                <p className="text-dark fw-bold mb-0 mt-3 fs-5">May 2026</p>
            </div>

            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <Table bordered className="mb-0" style={{ tableLayout: 'fixed', minWidth: '800px' }}>
                        <thead className="bg-light">
                            <tr>
                                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                                    <th key={day} className="text-muted fw-semibold py-3 px-3 border-bottom-0" style={{ fontSize: '0.8rem', width: '14.28%' }}>{day}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="p-2 border-end" style={{ height: '120px', verticalAlign: 'top' }}><div className="fw-bold fs-5 px-2">29</div></td>
                                <td className="p-2 border-end" style={{ height: '120px', verticalAlign: 'top' }}>
                                    <div className="fw-bold fs-5 px-2 text-muted">30</div>
                                    <div className="mt-2">
                                        <Badge bg="secondary" className="w-100 text-start py-2 px-2 text-wrap rounded-2 bg-opacity-25 text-secondary border">
                                            13:00 (60 min)
                                        </Badge>
                                    </div>
                                </td>
                                <td className="p-2 border-end" style={{ height: '120px', verticalAlign: 'top' }}><div className="fw-bold fs-5 px-2">1</div></td>
                                <td className="p-2 border-end" style={{ height: '120px', verticalAlign: 'top' }}><div className="fw-bold fs-5 px-2">2</div></td>
                                <td className="p-2 border-end" style={{ height: '120px', verticalAlign: 'top' }}><div className="fw-bold fs-5 px-2">3</div></td>
                                <td className="p-2 border-end" style={{ height: '120px', verticalAlign: 'top' }}><div className="fw-bold fs-5 px-2">4</div></td>
                                <td className="p-2" style={{ height: '120px', verticalAlign: 'top' }}><div className="fw-bold fs-5 px-2">5</div></td>
                            </tr>
                            <tr>
                                <td className="p-2 border-end" style={{ height: '120px', verticalAlign: 'top' }}><div className="fw-bold fs-5 px-2">6</div></td>
                                <td className="p-2 border-end" style={{ height: '120px', verticalAlign: 'top' }}><div className="fw-bold fs-5 px-2">7</div></td>
                                <td className="p-2 border-end" style={{ height: '120px', verticalAlign: 'top' }}>
                                    <div className="fw-bold fs-5 px-2">8</div>
                                    <div className="mt-2 d-flex flex-column gap-1">
                                        <Badge bg="success" className="w-100 text-start py-2 px-2 text-wrap rounded-2">
                                            9:00 (2 hours)
                                        </Badge>
                                        <Badge bg="success" className="w-100 text-start py-2 px-2 text-wrap rounded-2">
                                            13:00 (60 min)
                                        </Badge>
                                    </div>
                                </td>
                                <td className="p-2 border-end bg-primary bg-opacity-10 border-primary" style={{ height: '120px', verticalAlign: 'top' }}><div className="fw-bold fs-5 px-2">9</div></td>
                                <td className="p-2 border-end" style={{ height: '120px', verticalAlign: 'top' }}><div className="fw-bold fs-5 px-2">10</div></td>
                                <td className="p-2 border-end" style={{ height: '120px', verticalAlign: 'top' }}>
                                    <div className="fw-bold fs-5 px-2">11</div>
                                    <div className="mt-2 d-flex flex-column gap-1">
                                        <Badge bg="warning" className="w-100 text-start py-2 px-2 text-wrap rounded-2 text-dark">
                                            13:00 (info here)
                                        </Badge>
                                        <Badge bg="warning" className="w-100 text-start py-2 px-2 text-wrap rounded-2 text-dark">
                                            13:00 (info here)
                                        </Badge>
                                    </div>
                                </td>
                                <td className="p-2" style={{ height: '120px', verticalAlign: 'top' }}><div className="fw-bold fs-5 px-2">12</div></td>
                            </tr>
                            <tr>
                                <td className="p-2 border-end" style={{ height: '120px', verticalAlign: 'top' }}><div className="fw-bold fs-5 px-2">13</div></td>
                                <td className="p-2 border-end" style={{ height: '120px', verticalAlign: 'top' }}><div className="fw-bold fs-5 px-2">14</div></td>
                                <td className="p-2 border-end" style={{ height: '120px', verticalAlign: 'top' }}><div className="fw-bold fs-5 px-2">15</div></td>
                                <td className="p-2 border-end" style={{ height: '120px', verticalAlign: 'top' }}><div className="fw-bold fs-5 px-2">16</div></td>
                                <td className="p-2 border-end" style={{ height: '120px', verticalAlign: 'top' }}>
                                    <div className="fw-bold fs-5 px-2">17</div>
                                    <div className="mt-4 pt-4 d-flex flex-column gap-1">
                                        <Badge bg="warning" className="w-100 text-start py-2 px-2 text-wrap rounded-2 text-dark">
                                            21:00 (30 min)
                                        </Badge>
                                    </div>
                                </td>
                                <td className="p-2 border-end" style={{ height: '120px', verticalAlign: 'top' }}>
                                    <div className="fw-bold fs-5 px-2">18</div>
                                    <div className="mt-2 d-flex flex-column gap-1">
                                        <Badge bg="success" className="w-100 text-start py-2 px-2 text-wrap rounded-2">
                                            13:00 (text here)
                                        </Badge>
                                        <Badge bg="warning" className="w-100 text-start py-2 px-2 text-wrap rounded-2 text-dark">
                                            19:00 (60 min)
                                        </Badge>
                                    </div>
                                </td>
                                <td className="p-2" style={{ height: '120px', verticalAlign: 'top' }}><div className="fw-bold fs-5 px-2">19</div></td>
                            </tr>
                            <tr>
                                <td className="p-2 border-end" style={{ height: '120px', verticalAlign: 'top' }}><div className="fw-bold fs-5 px-2">20</div></td>
                                <td className="p-2 border-end" style={{ height: '120px', verticalAlign: 'top' }}>
                                    <div className="fw-bold fs-5 px-2">21</div>
                                    <div className="mt-2 d-flex flex-column gap-1">
                                        <Badge bg="warning" className="w-100 text-start py-2 px-2 text-wrap rounded-2 text-dark">
                                            13:00 (info here)
                                        </Badge>
                                        <Badge bg="warning" className="w-100 text-start py-2 px-2 text-wrap rounded-2 text-dark">
                                            13:00 (info here)
                                        </Badge>
                                    </div>
                                </td>
                                <td className="p-2 border-end" style={{ height: '120px', verticalAlign: 'top' }}><div className="fw-bold fs-5 px-2">22</div></td>
                                <td className="p-2 border-end" style={{ height: '120px', verticalAlign: 'top' }}><div className="fw-bold fs-5 px-2">23</div></td>
                                <td className="p-2 border-end" style={{ height: '120px', verticalAlign: 'top' }}>
                                    <div className="fw-bold fs-5 px-2">24</div>
                                    <div className="mt-4 pt-4 d-flex flex-column gap-1">
                                        <Badge bg="success" className="w-100 text-start py-2 px-2 text-wrap rounded-2">
                                            13:00 (60 min)
                                        </Badge>
                                    </div>
                                </td>
                                <td className="p-2 border-end" style={{ height: '120px', verticalAlign: 'top' }}><div className="fw-bold fs-5 px-2">25</div></td>
                                <td className="p-2" style={{ height: '120px', verticalAlign: 'top' }}><div className="fw-bold fs-5 px-2">26</div></td>
                            </tr>
                            <tr>
                                <td className="p-2 border-end" style={{ height: '120px', verticalAlign: 'top' }}><div className="fw-bold fs-5 px-2">27</div></td>
                                <td className="p-2 border-end" style={{ height: '120px', verticalAlign: 'top' }}><div className="fw-bold fs-5 px-2">28</div></td>
                                <td className="p-2 border-end" style={{ height: '120px', verticalAlign: 'top' }}><div className="fw-bold fs-5 px-2">29</div></td>
                                <td className="p-2 border-end" style={{ height: '120px', verticalAlign: 'top' }}><div className="fw-bold fs-5 px-2">30</div></td>
                                <td className="p-2 border-end" style={{ height: '120px', verticalAlign: 'top' }}><div className="fw-bold fs-5 px-2">31</div></td>
                                <td className="p-2 border-end" style={{ height: '120px', verticalAlign: 'top' }}><div className="fw-bold fs-5 px-2">1</div></td>
                                <td className="p-2" style={{ height: '120px', verticalAlign: 'top' }}><div className="fw-bold fs-5 px-2">2</div></td>
                            </tr>
                        </tbody>
                    </Table>
                </div>
            </Card>
        </>
    );
};

const Calendar = () => {
    return (
        <NurseLayout>
            <CalendarContent />
        </NurseLayout>
    );
};

export default Calendar;

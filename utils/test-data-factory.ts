import { ReservationData } from '../pages/employee/EmployeeReservationPage';

export class TestDataFactory {
  /**
   * Generate test customer data
   */
  static getTestCustomer() {
    return {
      name: `Test Customer ${Date.now()}`,
      email: `oscar+test${Date.now()}@vquip.com`,
      phone: `555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
    };
  }

  /**
   * Generate test reservation data
   */
  static getTestReservationData(): ReservationData {
    const customer = this.getTestCustomer();
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
      inventoryType: 'Sailboat',
      product: 'Compact Cruiser',
      timeSlot: 'Half Day 1 - 9:00 AM - 12:00 PM',
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      startDate: today.toISOString().split('T')[0],
      endDate: tomorrow.toISOString().split('T')[0],
      notes: 'Test reservation created by automated test'
    };
  }

  /**
   * Generate test reservation data with specific inventory type
   */
  static getTestReservationDataWithInventory(inventoryType: string, product: string): ReservationData {
    const baseData = this.getTestReservationData();
    return {
      ...baseData,
      inventoryType,
      product
    };
  }

  /**
   * Generate invalid test data for validation testing
   */
  static getInvalidReservationData(): Partial<ReservationData> {
    return {
      customerName: '',
      customerEmail: 'invalid-email',
      customerPhone: '123',
      startDate: '',
      endDate: ''
    };
  }

  /**
   * Get test inventory combinations
   */
  static getTestInventoryCombinations() {
    return [
      { inventoryType: 'Sailboat', products: ['Compact Cruiser', 'Day Sailer', 'Weekend Sailor'] },
      { inventoryType: 'PWC', products: ['Beginner\'s Buddy', 'Family Fun PWC', 'Lake Cruiser'] },
      { inventoryType: 'Houseboat', products: ['Compact Cruiser', 'Cozy Getaway', 'Family Fun Houseboat'] }
    ];
  }

  /**
   * Generate test date range
   */
  static getTestDateRange(daysFromNow: number = 1) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysFromNow);

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }

  /**
   * Generate test notes
   */
  static getTestNotes(): string {
    const notes = [
      'Test reservation for automated testing',
      'Customer requested early check-in',
      'Special equipment needed',
      'Customer has experience with this type of equipment',
      'Weather conditions may affect availability'
    ];
    return notes[Math.floor(Math.random() * notes.length)];
  }

  /**
   * Get test time slots
   */
  static getTestTimeSlots() {
    return [
      'Half Day 1 - 9:00 AM - 12:00 PM',
      'Half Day 2 - 1:00 PM - 4:00 PM',
      'Full Day - 9:00 AM - 4:00 PM',
      'Overnight - 4:00 PM - 9:00 AM'
    ];
  }

  /**
   * Generate test search criteria
   */
  static getTestSearchCriteria() {
    return {
      customerName: 'Test',
      customerEmail: 'test@',
      dateRange: this.getTestDateRange(7),
      status: 'Active'
    };
  }

  /**
   * Generate test filter options
   */
  static getTestFilterOptions() {
    return {
      dateRange: 'Next 7 days',
      status: 'All',
      inventoryType: 'All',
      sortBy: 'Date Created'
    };
  }
} 
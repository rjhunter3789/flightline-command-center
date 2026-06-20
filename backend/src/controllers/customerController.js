const Customer = require('../models/Customer');
const Deal = require('../models/Deal');
const logger = require('../utils/logger');

class CustomerController {
  async getCustomers(req, res) {
    try {
      const { page = 1, limit = 50, search } = req.query;
      const query = { dealership: req.dealershipId, isActive: true };

      if (search) {
        query.$or = [
          { firstName: new RegExp(search, 'i') },
          { lastName: new RegExp(search, 'i') },
          { email: new RegExp(search, 'i') },
          { phone: new RegExp(search, 'i') }
        ];
      }

      const customers = await Customer.find(query)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const count = await Customer.countDocuments(query);

      res.json({
        success: true,
        data: customers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: limit
        }
      });
    } catch (error) {
      logger.error('Error fetching customers:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch customers'
      });
    }
  }

  async getCustomerById(req, res) {
    try {
      const customer = await Customer.findOne({
        _id: req.params.id,
        dealership: req.dealershipId
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          error: 'Customer not found'
        });
      }

      res.json({
        success: true,
        data: customer
      });
    } catch (error) {
      logger.error('Error fetching customer:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch customer'
      });
    }
  }

  async createCustomer(req, res) {
    try {
      const customerData = {
        ...req.body,
        dealership: req.dealershipId
      };

      const customer = await Customer.create(customerData);

      res.status(201).json({
        success: true,
        data: customer
      });
    } catch (error) {
      logger.error('Error creating customer:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create customer'
      });
    }
  }

  async updateCustomer(req, res) {
    try {
      const customer = await Customer.findOneAndUpdate(
        {
          _id: req.params.id,
          dealership: req.dealershipId
        },
        req.body,
        { new: true, runValidators: true }
      );

      if (!customer) {
        return res.status(404).json({
          success: false,
          error: 'Customer not found'
        });
      }

      res.json({
        success: true,
        data: customer
      });
    } catch (error) {
      logger.error('Error updating customer:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update customer'
      });
    }
  }

  async deleteCustomer(req, res) {
    try {
      const customer = await Customer.findOneAndUpdate(
        {
          _id: req.params.id,
          dealership: req.dealershipId
        },
        { isActive: false },
        { new: true }
      );

      if (!customer) {
        return res.status(404).json({
          success: false,
          error: 'Customer not found'
        });
      }

      res.json({
        success: true,
        message: 'Customer deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting customer:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete customer'
      });
    }
  }

  async getCustomerDeals(req, res) {
    try {
      const deals = await Deal.find({
        customer: req.params.id,
        dealership: req.dealershipId
      })
        .populate('salesRep', 'firstName lastName')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: deals
      });
    } catch (error) {
      logger.error('Error fetching customer deals:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch customer deals'
      });
    }
  }

  async searchCustomers(req, res) {
    try {
      const { q } = req.query;
      
      if (!q || q.length < 2) {
        return res.json({
          success: true,
          data: []
        });
      }

      const customers = await Customer.find({
        dealership: req.dealershipId,
        isActive: true,
        $or: [
          { firstName: new RegExp(q, 'i') },
          { lastName: new RegExp(q, 'i') },
          { email: new RegExp(q, 'i') },
          { phone: new RegExp(q, 'i') }
        ]
      })
        .limit(10)
        .select('firstName lastName email phone');

      res.json({
        success: true,
        data: customers
      });
    } catch (error) {
      logger.error('Error searching customers:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search customers'
      });
    }
  }
}

module.exports = new CustomerController();
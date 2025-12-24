const BaseService = require('./BaseService');

class PartyService extends BaseService {
  constructor(db) {
    super(db);
  }

  async createParty(companyId, partyData) {
    return await this.withTransaction(async (trx) => {
      await this.validateCompany(companyId, trx);
      
      if (partyData.gstin) {
        this.validateGSTIN(partyData.gstin);
      }

      const existingParty = await this.enforceCompanyIsolation(
        trx('parties').where('name', partyData.name),
        companyId
      ).first();

      if (existingParty) {
        throw new Error('Party with this name already exists');
      }

      const party = {
        company_id: companyId,
        name: partyData.name,
        party_type: partyData.party_type,
        gstin: partyData.gstin,
        pan: partyData.pan,
        address_line1: partyData.address_line1,
        address_line2: partyData.address_line2,
        city: partyData.city,
        state: partyData.state,
        pincode: partyData.pincode,
        phone: partyData.phone,
        email: partyData.email,
        credit_limit: partyData.credit_limit || 0,
        credit_days: partyData.credit_days || 0,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      const [partyId] = await trx('parties').insert(party);
      
      return await this.enforceCompanyIsolation(
        trx('parties').where('id', partyId),
        companyId
      ).first();
    });
  }

  validateGSTIN(gstin) {
    if (!gstin) return true;
    
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    
    if (!gstinRegex.test(gstin)) {
      throw new Error('Invalid GSTIN format');
    }

    const checksumDigits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let factor = 2;
    let sum = 0;
    
    for (let i = gstin.length - 2; i >= 0; i--) {
      let codePoint = checksumDigits.indexOf(gstin[i]);
      let digit = factor * codePoint;
      factor = factor === 2 ? 1 : 2;
      digit = Math.floor(digit / 36) + (digit % 36);
      sum += digit;
    }
    
    const checksum = (36 - (sum % 36)) % 36;
    const expectedChecksum = checksumDigits[checksum];
    
    if (gstin[gstin.length - 1] !== expectedChecksum) {
      throw new Error('Invalid GSTIN checksum');
    }
    
    return true;
  }

  async getPartyById(companyId, partyId) {
    const party = await this.enforceCompanyIsolation(
      this.db('parties').where('id', partyId),
      companyId
    ).first();

    if (!party) {
      throw new Error('Party not found');
    }

    return party;
  }

  async updateParty(companyId, partyId, updateData) {
    return await this.withTransaction(async (trx) => {
      const existingParty = await this.getPartyById(companyId, partyId);
      
      if (updateData.gstin) {
        this.validateGSTIN(updateData.gstin);
      }

      if (updateData.name && updateData.name !== existingParty.name) {
        const nameExists = await this.enforceCompanyIsolation(
          trx('parties')
            .where('name', updateData.name)
            .where('id', '!=', partyId),
          companyId
        ).first();

        if (nameExists) {
          throw new Error('Party with this name already exists');
        }
      }

      const updatedData = {
        ...updateData,
        updated_at: new Date()
      };

      await this.enforceCompanyIsolation(
        trx('parties').where('id', partyId),
        companyId
      ).update(updatedData);

      return await this.getPartyById(companyId, partyId);
    });
  }

  async searchParties(companyId, searchTerm, partyType = null, limit = 50) {
    let query = this.enforceCompanyIsolation(
      this.db('parties'),
      companyId
    ).where('is_active', true);

    if (searchTerm) {
      query = query.where(function() {
        this.where('name', 'like', `%${searchTerm}%`)
            .orWhere('gstin', 'like', `%${searchTerm}%`)
            .orWhere('phone', 'like', `%${searchTerm}%`);
      });
    }

    if (partyType) {
      query = query.where('party_type', partyType);
    }

    return await query
      .orderBy('name')
      .limit(limit)
      .select('id', 'name', 'party_type', 'gstin', 'phone', 'city');
  }

  async getPartyBalance(companyId, partyId) {
    const party = await this.getPartyById(companyId, partyId);
    
    const balance = await this.enforceCompanyIsolation(
      this.db('ledger_balances as lb')
        .join('ledgers as l', 'lb.ledger_id', 'l.id')
        .where('l.party_id', partyId),
      companyId
    ).sum('lb.debit_balance as total_debit')
     .sum('lb.credit_balance as total_credit')
     .first();

    const netBalance = (balance.total_debit || 0) - (balance.total_credit || 0);
    
    return {
      party_id: partyId,
      party_name: party.name,
      debit_balance: balance.total_debit || 0,
      credit_balance: balance.total_credit || 0,
      net_balance: netBalance,
      balance_type: netBalance >= 0 ? 'debit' : 'credit'
    };
  }
}

module.exports = PartyService;
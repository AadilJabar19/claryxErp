const BaseService = require('./BaseService');

class AuditLogService extends BaseService {
  async insertLog({ companyId, userId, entityType, entityId, action, metadata }, trx) {
    const db = trx || this.db;
    return await db('audit_logs').insert({
      company_id: companyId,
      user_id: userId,
      entity_type: entityType,
      entity_id: entityId,
      action: action,
      metadata: metadata
    });
  }

  async getLogs(filters) {
    let query = this.db('audit_logs');
    
    if (filters.companyId) {
      query = query.where('company_id', filters.companyId);
    }
    if (filters.entityType) {
      query = query.where('entity_type', filters.entityType);
    }
    if (filters.entityId) {
      query = query.where('entity_id', filters.entityId);
    }
    if (filters.action) {
      query = query.where('action', filters.action);
    }
    
    return await query.orderBy('created_at', 'desc');
  }
}

module.exports = AuditLogService;
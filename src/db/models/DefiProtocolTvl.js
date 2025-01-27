const SequelizeModel = require('./SequelizeModel')
const DefiProtocol = require('./DefiProtocol')

class DefiProtocolTvl extends SequelizeModel {

  static init(sequelize, DataTypes) {
    return super.init(
      {
        date: {
          type: DataTypes.DATE,
          allowNull: false
        },
        tvl: {
          type: DataTypes.DECIMAL,
          allowNull: false
        },
        chain_tvls: DataTypes.JSONB,
        //  {
        //    Ethereum: 8846196.10,
        //    Polygon:  197489.07
        //    Staking:  14440365.167
        //  }
      },
      {
        sequelize,
        tableName: 'defi_protocol_tvls',
        indexes: [{
          unique: true,
          fields: ['date', 'defi_protocol_id']
        }]
      }
    )
  }

  static associate(models) {
    DefiProtocolTvl.belongsTo(models.DefiProtocol, {
      foreignKey: 'defi_protocol_id'
    })
  }

  static async getListByCoinUid(uid, dateFrom, window) {
    const [defiProtocol] = await DefiProtocol.query('SELECT D.id FROM coins C LEFT JOIN defi_protocols D on D.coin_id = C.id WHERE uid = :uid LIMIT 1', {
      uid
    })

    if (!defiProtocol) {
      return []
    }

    const query = (`
      SELECT
        EXTRACT(epoch FROM t2.time)::int AS date,
        t1.tvl
      FROM defi_protocol_tvls t1
      JOIN (
        SELECT
          ${this.truncateDateWindow('date', window)} as time,
          max(id) as max_id,
          max(date) as max_date
         FROM defi_protocol_tvls
        WHERE defi_protocol_id = :defi_protocol_id
          AND date >= :dateFrom
        GROUP by time
      ) t2 ON (t1.id = t2.max_id AND t1.date = t2.max_date)
      ORDER BY date
    `)

    return DefiProtocolTvl.query(query, { defi_protocol_id: defiProtocol.id, dateFrom })
  }

  static getListByDate(dateTo, interval = '1 day') {
    const query = `
      SELECT
        P.defillama_id,
        T.defi_protocol_id,
        T.tvl
       FROM defi_protocol_tvls T
       JOIN defi_protocols P on P.id = T.defi_protocol_id
      WHERE date <= :dateTo
        AND date >= (date :dateTo - INTERVAL :interval)
      ORDER BY T.date
    `

    return DefiProtocolTvl.query(query, { dateTo, interval })
  }

  static async exists() {
    return !!await DefiProtocolTvl.findOne()
  }

  static deleteExpired(dateFrom, dateTo) {
    return DefiProtocolTvl.query('DELETE FROM defi_protocol_tvls WHERE date > :dateFrom AND date < :dateTo', {
      dateFrom,
      dateTo
    })
  }

  static delete(defiProtocolIds) {
    return DefiProtocolTvl.destroy({
      where: {
        defi_protocol_id: defiProtocolIds
      }
    })
  }
}

module.exports = DefiProtocolTvl

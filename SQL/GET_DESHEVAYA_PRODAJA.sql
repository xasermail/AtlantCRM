/* получить дешёвые продажи, дешевле, чем цена у Дилера A */

if exists(select 1 from sys.procedures as a where a.name = 'GET_DESHEVAYA_PRODAJA') drop procedure dbo.GET_DESHEVAYA_PRODAJA;

GO

create procedure [dbo].[GET_DESHEVAYA_PRODAJA]
  -- ИД Дилера A, с которым надо сравнивать
  @m_org_id_a int,
  -- расход со склада, который надо проверить
  @o_sklad_ras_id int
as begin

  -- Тип оповещения "Дешёвая продажа"
  declare @O_OPOV_TIP_DESHEVAYA_PRODAJA int = 2;

  select
    p.*
  from
    dbo.O_SKLAD_RAS r
    join dbo.O_SKLAD_RAS_PRODUCT p on p.O_SKLAD_RAS_ID = r.ID
  where
    r.ID = @o_sklad_ras_id
    -- товар выдан
    and p.IS_VID = 1
    -- дешевле, чем розница Дилера A
    and exists(
      select
        *
      from
        dbo.O_DILER_A_PRICE price
      where
        price.M_PRODUCT_ID_TOVAR = p.M_PRODUCT_ID
        -- продажа дешевле, чем розница
        and price.ROZN > p.COST
        -- и ещё не было оповещения по этому событию
        and not exists(
          select
            *
          from
            dbo.O_OPOV o
          where
            o.TIP = @O_OPOV_TIP_DESHEVAYA_PRODAJA
            and o.O_SKLAD_RAS_PRODUCT_ID = p.ID
        )
    )
  ;


end; -- proc

GO

exec [dbo].[GET_DESHEVAYA_PRODAJA] @m_org_id_a = 2, @o_sklad_ras_id = 10

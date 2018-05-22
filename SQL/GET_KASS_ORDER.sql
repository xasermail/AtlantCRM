/* получить данные для кассового ордера */

if exists(select 1 from sys.procedures as a where a.name = 'GET_KASS_ORDER') drop procedure dbo.GET_KASS_ORDER;

GO

create procedure [dbo].[GET_KASS_ORDER]
  @id int
as begin

set datefirst 1;
set nocount on;
set ansi_warnings off;

-- про кассовый ордер пока не совсем понятно, сколько
-- продуктов будет в одном, поэтому считаю, что будет
-- ровно один
if (object_id('tempdb..#o_sklad_ras_product') is not null) drop table #o_sklad_ras_product;
select top 1
  *
into
  #o_sklad_ras_product
from
  dbo.O_SKLAD_RAS_PRODUCT r
where
  r.O_SKLAD_RAS_ID = @id
order by
  r.ID
;

select
  o.NAME m_org_name,
  r.N_SCHET n_schet,
  r.D_SCHET d_schet,
  isnull(a.SURNAME, r.SURNAME) o_ank_surname,
  isnull(a.NAME, r.NAME) o_ank_name,
  isnull(a.SECNAME, r.SECNAME) o_ank_secname,
  p.NAME m_product_name,
  cast(floor(rp.COST) as int) summa_rub,
  cast(rp.COST * 100 - floor(rp.COST)*100 as int) summa_kop,
  u.SURNAME s_user_surname,
  dbo.suv_summa_Propisyu(rp.COST) summa_propisyu,
  rp.COST summa
from
  dbo.O_SKLAD_RAS r
  left join dbo.M_ORG o on r.M_ORG_ID = o.ID
  left join dbo.O_ANK a on a.ID = r.O_ANK_ID
  left join #o_sklad_ras_product rp on rp.O_SKLAD_RAS_ID = r.ID
  left join dbo.M_PRODUCT p on p.ID = rp.M_PRODUCT_ID
  left join dbo.S_USER u on u.ID = r.S_USER_ID
where
  r.ID = @id
;

if (object_id('tempdb..#o_sklad_ras_product') is not null) drop table #o_sklad_ras_product;

  
end;

go


set dateformat dmy;
exec dbo.GET_KASS_ORDER @id = 32;
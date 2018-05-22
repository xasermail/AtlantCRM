/* получить статусы продуктов в режиме "Общение" */

if exists(select 1 from sys.procedures as a where a.name = 'GET_DIALOG_PRODUCT_STATUS_LIST') drop procedure dbo.GET_DIALOG_PRODUCT_STATUS_LIST;

GO

create procedure [dbo].[GET_DIALOG_PRODUCT_STATUS_LIST]
  @o_ank_id int
as begin

set datefirst 1;
set nocount on;
set ansi_warnings off;

-- купленый продукт, по которому есть долг
select
  p.NAME product_name,
  (
    select max(rpo.D_OPL) D_OPL from dbo.O_SKLAD_RAS_PRODUCT_OPL rpo
     where rpo.O_SKLAD_RAS_PRODUCT_ID = rp.ID
  ) d_last_opl,
  r.ID o_sklad_ras_id
from
  dbo.O_SKLAD_RAS r
  join dbo.O_ANK a on a.ID = r.O_ANK_ID
  join dbo.O_SKLAD_RAS_PRODUCT rp on rp.O_SKLAD_RAS_ID = r.ID
  left join dbo.M_PRODUCT p on p.ID = rp.M_PRODUCT_ID
where
  a.ID = @o_ank_id
  and rp.OPL_OST > 0
order by rp.ID asc;
  
end;

go


set dateformat dmy;
exec dbo.GET_DIALOG_PRODUCT_STATUS_LIST @o_ank_id = 239;
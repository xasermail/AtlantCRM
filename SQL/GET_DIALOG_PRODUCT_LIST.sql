/* получить товары в режиме "Общение" */

if exists(select 1 from sys.procedures as a where a.name = 'GET_DIALOG_PRODUCT_LIST') drop procedure dbo.GET_DIALOG_PRODUCT_LIST;

GO

create procedure [dbo].[GET_DIALOG_PRODUCT_LIST]
  @o_ank_id int
as begin

set datefirst 1;
set nocount on;
set ansi_warnings off;

-- купленый продукт
select
  p.NAME product_name,
  rp.D_VID d_vid,
  r.ID o_sklad_ras_id,
  p.IS_ABON is_abon,
  -- условие and rp.D_DEISTV is not null на случай, если они не проставят дату действия по ошибке
  case when p.IS_ABON = 1 and rp.D_DEISTV is not null then dbo.GET_ABON_DAY_COUNT(rp.D_DEISTV, a.M_ORG_ID) else 0 end ostalos,
  rp.D_DEISTV d_deistv
from
  dbo.O_SKLAD_RAS r
  join dbo.O_ANK a on a.ID = r.O_ANK_ID
  join dbo.O_SKLAD_RAS_PRODUCT rp on rp.O_SKLAD_RAS_ID = r.ID
  left join dbo.M_PRODUCT p on p.ID = rp.M_PRODUCT_ID
where
  a.ID = @o_ank_id
  and isnull(rp.OPL_OST,0) = 0
order by
  rp.ID asc
;
  
end;

go


set dateformat dmy;
exec dbo.GET_DIALOG_PRODUCT_LIST @o_ank_id = 17230;
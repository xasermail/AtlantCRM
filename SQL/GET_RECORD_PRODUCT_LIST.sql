/* получить товары в режиме "Общение" */

if exists(select 1 from sys.procedures as a where a.name = 'GET_RECORD_PRODUCT_LIST') drop procedure dbo.GET_RECORD_PRODUCT_LIST;

GO

create procedure [dbo].[GET_RECORD_PRODUCT_LIST]
  @o_ank_id int
as begin

set datefirst 1;
set nocount on;
set ansi_warnings off;

-- купленый продукт
select
  p.NAME,
	sum(isnull(rp.KOLVO,0)) CNT
from
  dbo.O_SKLAD_RAS r
  join dbo.O_ANK a on a.ID = r.O_ANK_ID
  join dbo.O_SKLAD_RAS_PRODUCT rp on rp.O_SKLAD_RAS_ID = r.ID
  left join dbo.M_PRODUCT p on p.ID = rp.M_PRODUCT_ID
where
  a.ID = @o_ank_id
group by rp.M_PRODUCT_ID, p.NAME;
end;

go


set dateformat dmy;
exec dbo.GET_RECORD_PRODUCT_LIST @o_ank_id = 1085;
/* получить данные отчета "Проплаты за период" */

if exists(select 1 from sys.procedures as a where a.name = 'GET_PROPL_ZA_PER') drop procedure dbo.GET_PROPL_ZA_PER;

GO

create procedure [dbo].[GET_PROPL_ZA_PER]
  @m_org_id int,
  @dateBeg smalldatetime,
  @dateEnd smalldatetime
as begin

set datefirst 1;
set nocount on;
set ansi_warnings off;

select
  isnull(
    isnull(a.SURNAME + ' ', '') + isnull(a.NAME + ' ', '') + isnull(a.SECNAME, ''),
    isnull(r.SURNAME + ' ', '') + isnull(r.NAME + ' ', '') + isnull(r.SECNAME, '')
  ) fio,
  p.NAME product_name,
  rpo.OPL opl,
  rp.D_VID d_vid,
  isnull(a.PHONE_MOBILE, r.PHONE_MOBILE) phone_mobile
from
  dbo.O_SKLAD_RAS r
  left join dbo.O_ANK a on a.ID = r.O_ANK_ID
  left join dbo.O_SKLAD_RAS_PRODUCT rp on rp.O_SKLAD_RAS_ID = r.ID
  left join dbo.O_SKLAD_RAS_PRODUCT_OPL rpo on rpo.O_SKLAD_RAS_PRODUCT_ID = rp.ID
  left join dbo.M_PRODUCT p on p.ID = rp.M_PRODUCT_ID
where
  rpo.M_ORG_ID = @m_org_id
  and cast(rpo.D_OPL as date) between @dateBeg and @dateEnd
;
  
end;

go


set dateformat dmy;
exec dbo.GET_PROPL_ZA_PER @m_org_id = 1, @dateBeg = '01.02.2017', @dateEnd = '12.02.2017';
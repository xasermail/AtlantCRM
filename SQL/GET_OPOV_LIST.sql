/* �������� ������ ���������� */

if exists(select 1 from sys.procedures as a where a.name = 'GET_OPOV_LIST') drop procedure dbo.GET_OPOV_LIST;

GO

create procedure [dbo].[GET_OPOV_LIST]
as begin

SET CONCAT_NULL_YIELDS_NULL OFF;

-- ��� ���������� "����� ������"
declare @O_OPOV_TIP_CHUJOY_KLIENT int = 1;
-- ��� ���������� "������� �������"
declare @O_OPOV_TIP_DESHEVAYA_PRODAJA int = 2;

select
  o.ID O_OPOV_ID,
  /*isnull(a.SURNAME + ' ', '') + isnull(left(a.NAME, 1) + '. ', '') + isnull(left(a.SECNAME, 1) + '.', '') FIO,
  a.PHONE_MOBILE PHONE_MOBILE,
  o.M_ORG_ID M_ORG_ID,*/
  a.ID O_ANK_ID,
  /*oSource.ADRES org_adres_source,
  oSource.NAME org_name_source,
  org.ADRES org_adres,
  org.NAME org_name,*/
  @O_OPOV_TIP_CHUJOY_KLIENT TIP,
  null O_SKLAD_RAS_ID,
  /*null PRODUCT_NAME,
  null COST,
  null ROZN,*/
  '[����� ����� ' + convert(varchar, o.D_START, 120) + '] ' + isnull(a.SURNAME + ' ', '') + isnull(a.NAME + ' ', '') + isnull(a.SECNAME, '') + ' ' + isnull(a.PHONE_MOBILE, '') + ', ������ �����: ' + oSource.NAME + '(' + oSource.ADRES + '), �������� � ' + org.NAME + '(' + org.ADRES + ')' caption
from
  dbo.O_OPOV o
  left join dbo.O_ANK a on a.ID = o.O_ANK_ID
  left join dbo.M_ORG oSource on oSource.ID = o.M_ORG_ID_SOURCE
  left join dbo.M_ORG org on org.ID = o.M_ORG_ID
where o.TIP = @O_OPOV_TIP_CHUJOY_KLIENT
  and org.DEISTV = 1
	and oSource.DEISTV = 1

union all

select
  o.ID O_OPOV_ID,
  /*isnull(a.SURNAME + ' ', '') + isnull(left(a.NAME, 1) + '. ', '') + isnull(left(a.SECNAME, 1) + '.', '') FIO,
  a.PHONE_MOBILE PHONE_MOBILE,
  o.M_ORG_ID M_ORG_ID,*/
  a.ID O_ANK_ID,
  /*null org_adres_source,
  null org_name_source,
  org.ADRES org_adres,
  org.NAME org_name,*/
  @O_OPOV_TIP_DESHEVAYA_PRODAJA TIP,
  p.O_SKLAD_RAS_ID O_SKLAD_RAS_ID,
  /*product.NAME PRODUCT_NAME,
  p.COST COST,
  price.ROZN ROZN,*/
  '[���� ���� ' + convert(varchar, o.D_START, 120) + '] ' + isnull(a.SURNAME + ' ', '') + isnull(a.NAME + ' ', '') + isnull(a.SECNAME, '') + isnull(a.PHONE_MOBILE, '') + ', ����� ' + product.NAME + ' �� ' + org.NAME + '(' + org.ADRES + ') �� ' + cast(p.COST as varchar(50)) + ' ���., ���� ������ ' + cast(price.ROZN as varchar(50)) + ' ���. ' caption
from
  dbo.O_OPOV o
  left join dbo.O_ANK a on a.ID = o.O_ANK_ID
  left join dbo.M_ORG org on org.ID = o.M_ORG_ID
  left join dbo.O_SKLAD_RAS_PRODUCT p on p.ID = o.O_SKLAD_RAS_PRODUCT_ID
  left join dbo.M_PRODUCT product on product.ID = p.M_PRODUCT_ID
  left join dbo.O_DILER_A_PRICE price on price.M_PRODUCT_ID_TOVAR = product.ID and price.M_ORG_ID = o.M_ORG_ID_A
where o.TIP = @O_OPOV_TIP_DESHEVAYA_PRODAJA
	and org.DEISTV = 1
order by
  1 desc
;

-- ��� ����� ��� ������������� 17 �� 2000 ������, ���� ������ 3000 ������

end; -- proc

GO

exec dbo.GET_OPOV_LIST;
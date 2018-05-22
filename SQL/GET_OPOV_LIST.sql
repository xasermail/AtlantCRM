/* получить список Оповещений */

if exists(select 1 from sys.procedures as a where a.name = 'GET_OPOV_LIST') drop procedure dbo.GET_OPOV_LIST;

GO

create procedure [dbo].[GET_OPOV_LIST]
as begin

SET CONCAT_NULL_YIELDS_NULL OFF;

-- Тип оповещения "Чужой клиент"
declare @O_OPOV_TIP_CHUJOY_KLIENT int = 1;
-- Тип оповещения "Дешёвая продажа"
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
  '[Чужой салон ' + convert(varchar, o.D_START, 120) + '] ' + isnull(a.SURNAME + ' ', '') + isnull(a.NAME + ' ', '') + isnull(a.SECNAME, '') + ' ' + isnull(a.PHONE_MOBILE, '') + ', родной салон: ' + oSource.NAME + '(' + oSource.ADRES + '), появился в ' + org.NAME + '(' + org.ADRES + ')' caption
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
  '[Цена ниже ' + convert(varchar, o.D_START, 120) + '] ' + isnull(a.SURNAME + ' ', '') + isnull(a.NAME + ' ', '') + isnull(a.SECNAME, '') + isnull(a.PHONE_MOBILE, '') + ', купил ' + product.NAME + ' на ' + org.NAME + '(' + org.ADRES + ') за ' + cast(p.COST as varchar(50)) + ' руб., цена дилера ' + cast(price.ROZN as varchar(50)) + ' руб. ' caption
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

-- ФИО купил МХМ Революционная 17 за 2000 рублей, цена дилера 3000 рублей

end; -- proc

GO

exec dbo.GET_OPOV_LIST;
-- =============================================
-- Author:		Maynskiy Andrey
-- Create date: 31-01-2017
-- Description:	���������� ��� ������ ��� ��������
-- =============================================
if exists(select 1 from sys.procedures as a where a.name = 'GET_REPORT_BIRTHDAY') drop procedure dbo.GET_REPORT_BIRTHDAY;

GO

create procedure dbo.GET_REPORT_BIRTHDAY
	@fromDate smalldatetime,
	@toDate smalldatetime,
	@m_org_id int
AS	
BEGIN
	
	/*
	declare @fromDate smalldatetime
	set @fromDate = cast('2016-02-01' as datetime)

	declare @toDate smalldatetime
	set @toDate = cast('2017-03-02' as datetime)

	declare @m_org_id int
	set @m_org_id= 1
	--*/

	--������� ��� �������� ����������� �������
	declare @existCalls table(O_ANK_ID int)
	insert	@existCalls
	--������ ����� �� �������� ��� ������ ���������� �� ����� � ����� ���������
	--�������� ��������, ��� ��������� �������� � �������� ��� ��� ��������� �� ��������� ���
	select	c.O_ANK_ID
	from	O_REPORT_BIRTHDAY_CALL as c
	where	c.M_ORG_ID = @m_org_id
			and year(c.D_START) = year(@toDate)

	select
      a.ID as ANK_ID,
			a.SURNAME,
			a.[NAME],
			a.SECNAME,
			a.BIRTHDAY,		--���� ��������
			datediff(year,a.BIRTHDAY,@toDate) as AGE,		--�������
			datediff(day, dbo.CREATE_DATE(@m_org_id),DATEADD(year,datediff(year,a.BIRTHDAY,@toDate), a.BIRTHDAY)) as DAYS_LEFT, -- ���� ��������
			cast(0 as int) as PRODUCT_COUNT,	--
			case		--�������� ������� "������ ��������", ���� � ������� ���� �������������� ������
				when e.O_ANK_ID is null 
				then cast(0 as bit) else 
				cast(1 as bit) 
			end as [CALL]  --���������
	from	O_ANK as a
			left join @existCalls as e on e.O_ANK_ID = a.ID
	where	a.M_ORG_ID = @m_org_id
			and (
					month(a.BIRTHDAY) > month(@fromDate)
					or
					(month(a.BIRTHDAY) = month(@fromDate)
					and day(a.BIRTHDAY) >= day(@fromDate))
				)
			and (
					month(a.BIRTHDAY) < month(@toDate)
					or 
					(month(a.BIRTHDAY) = month(@toDate)
					and day(a.BIRTHDAY) <= day(@toDate))
				)
  order by
    DAYS_LEFT
  ;
END 
GO